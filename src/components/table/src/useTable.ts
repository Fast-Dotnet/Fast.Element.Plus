import { computed, nextTick, onBeforeUnmount, provide, reactive, shallowRef, watch } from "vue";
import { dayjs, useGlobalSize } from "element-plus";
import { callOptionalFunction, debounce } from "../../../utils";
import { createLoadingTasks } from "../../../utils/loading-tasks";
import { tableUtil } from "../utils/table";
import { getTableDefaultSlots } from "./table.type";
import type { TableInstance } from "element-plus";
import type { ExtractPropTypes, InjectionKey, SetupContext, ShallowRef } from "vue";
import type { makeSlots } from "../../../utils";
import type { PagedInput, PagedResult } from "./page.type";
import type { FaTableSlots, faTableEmits, faTableProps } from "./table";
import type { DefaultRow, FaTableState } from "./table.state";
import type { FaTableColumnCtx, FaTableEnumColumnCtx } from "./table.type";

/** FaTable 状态的依赖注入键。 */
export const tableStateKey: InjectionKey<FaTableState> = Symbol("tableState");
/** FaTable 枚举映射的依赖注入键。 */
export const enumMapKey: InjectionKey<Map<string, FaTableEnumColumnCtx[]>> = Symbol("enumMap");

type TableSetupContext = SetupContext<typeof faTableEmits, ReturnType<typeof makeSlots<FaTableSlots>>>;

interface TableComposable {
	globalSize: ReturnType<typeof useGlobalSize>;
	state: FaTableState;
	elementRef: Readonly<ShallowRef<HTMLElement | null>>;
	tableRef: Readonly<ShallowRef<TableInstance | null>>;
	handleTableColumnAutoWidth: () => void;
	getRequestParam: () => PagedInput;
	loadTableColumns: () => void;
	handleSizeChange: (pageSize: number) => void;
	handlePaginationChange: (value: number) => void;
	defaultSearchTime: () => void;
	tableSearch: () => Promise<void>;
	tableReset: () => Promise<void>;
	doRender: () => Promise<void>;
	setManualLoading: (loading: boolean) => void;
	doLoading: (loadingFunction: () => void | Promise<void>, loadingText?: string) => Promise<void>;
	handleCustomCellClick: (emitName: string, context: { row: DefaultRow; column: FaTableColumnCtx; $index: number }) => void;
}

/**
 * 创建 FaTable 的状态和操作方法。
 *
 * @param props - FaTable 的 Props。
 * @param slots - FaTable 的插槽。
 * @param emit - FaTable 的事件触发器。
 * @returns FaTable 的状态、引用和操作方法。
 */
export const useTable = (
	props: ExtractPropTypes<typeof faTableProps>,
	slots: TableSetupContext["slots"],
	emit: TableSetupContext["emit"]
): TableComposable => {
	const globalSize = useGlobalSize();

	const elementRef = shallowRef<HTMLElement | null>(null);
	const tableRef = shallowRef<TableInstance | null>(null);

	/**
	 * 定义 enumMap 存储 enum 值（避免异步请求无法格式化单元格内容 || 无法填充搜索下拉选择）
	 */
	const enumMap = reactive(new Map<string, FaTableEnumColumnCtx[]>());
	provide(enumMapKey, enumMap);

	const state: FaTableState = reactive({
		loading: false,
		loadingText: "加载中...",
		orgColumns: [],
		tableColumns: computed(() => state.orgColumns.filter((f) => f.prop && !f.pureSearch)),
		searchColumns: computed(() =>
			state.orgColumns
				.filter((item) => item.pureSearch === true || item.search !== undefined)
				.sort((a, b) => {
					return (a.search?.order ?? 0) - (b.search?.order ?? 0);
				})
		),
		spanColumns: computed(() => [
			...state.orgColumns.flatMap((column) => (column.spanProp ? [{ prop: column.prop ?? "", spanProp: column.spanProp }] : [])),
			...(props.props.span
				? [
						{ prop: "__table-expand", spanProp: props.props.span },
						{ prop: "__table-selection", spanProp: props.props.span },
						{ prop: "__table-index", spanProp: props.props.span },
						{ prop: "__table-operation", spanProp: props.props.span },
					]
				: []),
		]),
		tableData: [],
		tableSpanData: computed(() => {
			if (state.spanColumns.length > 0 && state.tableData.length > 0) {
				const result: Record<string, number[]> = {};
				const spanIndexes: Record<string, number> = {};
				state.spanColumns.forEach((item) => {
					result[item.prop] = new Array<number>(state.tableData.length).fill(1, 0, 1).fill(0, 1);
					spanIndexes[item.prop] = 0;
				});
				for (let i = 1; i < state.tableData.length; i++) {
					state.spanColumns.forEach((item) => {
						const currentRow = state.tableData[i];
						const previousRow = state.tableData[i - 1];
						const spanValues = result[item.prop];
						const spanIndex = spanIndexes[item.prop];
						if (currentRow === undefined || previousRow === undefined || spanValues === undefined || spanIndex === undefined) return;
						if (currentRow[item.spanProp] === previousRow[item.spanProp]) {
							spanValues[spanIndex] = (spanValues[spanIndex] ?? 0) + 1;
						} else {
							spanIndexes[item.prop] = i;
							spanValues[i] = 1;
						}
					});
				}
				return result;
			}
			return {};
		}),
		tablePagination: {
			pageIndex: 1,
			pageSize: 20,
			totalRows: 0,
		},
		initParam: {},
		searchParam: {},
		searchValueUpdate: "",
		searchForm: props.searchForm,
		selected: false,
		selectedList: [],
		selectedListIds: computed(() =>
			state.selectedList.flatMap((item) => {
				const rowKey: unknown =
					typeof props.rowKey === "function" ? props.rowKey(item) : tableUtil.handleRowAccordingToProp(item, props.rowKey);
				return typeof rowKey === "string" || typeof rowKey === "number" ? [rowKey] : [];
			})
		),
		indeterminateSelectedListIds: [],
		operationColumnWidth: computed(() => {
			const findAutoCol = state.autoColumnWidth.find((f) => f.prop === "__table-operation");
			if (findAutoCol) {
				return `${findAutoCol.width}px`;
			}
			switch (globalSize.value) {
				case "large":
				case "default":
					return "54px";
				case "small":
					return "42px";
				case "":
				default:
					return "auto";
			}
		}),
		imagePreview: false,
		previewList: [],
		tableWidth: 0,
		tableHeight: 0,
		autoColumnWidth: [],
	});
	// 请求与列宽各自失效，Loading 按任务独立释放。
	let requestVersion = 0;
	let widthVersion = 0;
	let disposed = false;
	let releaseRequest: (() => void) | undefined;
	let releaseWidth: (() => void) | undefined;
	let releaseManual: (() => void) | undefined;

	const unmountedError = new Error("FaTable 已卸载，待执行的渲染已取消。");
	const loadingTasks = createLoadingTasks((loading, text) => {
		state.loading = loading;
		state.loadingText = text ?? "加载中...";
	});

	provide(tableStateKey, state);

	const handleTableColumnAutoWidth = (): void => {
		if (disposed) return;
		const currentWidthVersion = ++widthVersion;
		releaseWidth?.();
		const done = loadingTasks.begin();
		releaseWidth = done;
		state.autoColumnWidth = [];
		const autoWidthColumns = state.tableColumns.filter((f) => f.autoWidth);
		if (slots.operation) {
			// 操作列自动宽度
			autoWidthColumns.push({
				prop: "__table-operation",
			});
		}
		if (autoWidthColumns.length > 0) {
			// padding24/16 + border1
			const otherWidth = globalSize.value === "default" ? 25 : 17;
			nextTick(() => {
				if (disposed || currentWidthVersion !== widthVersion) return;
				const tableDom = document.querySelector(`.fa-table__${props.tableKey}`);
				if (tableDom) {
					autoWidthColumns.forEach((item) => {
						const headerColumnDom = tableDom.querySelector(`.__fa-table__auto-width-column__cell-header__${item.prop}`);
						const cellColumnDoms = tableDom.querySelectorAll(`.__fa-table__auto-width-column__cell__${item.prop}`);
						let maxWidth = 0;
						if (headerColumnDom) {
							maxWidth = Math.ceil(headerColumnDom.scrollWidth) + otherWidth;
							if (item.sortable) {
								maxWidth += 24;
							}
						}
						cellColumnDoms.forEach((cellDom) => {
							const curWidth = Math.ceil(cellDom.scrollWidth) + otherWidth;
							if (curWidth > maxWidth) {
								maxWidth = curWidth;
							}
						});
						const autoWidthEntry = state.autoColumnWidth.find((f) => f.prop === item.prop);
						if (autoWidthEntry) {
							autoWidthEntry.width = Math.max(autoWidthEntry.width, maxWidth);
						} else {
							if (item.prop) {
								state.autoColumnWidth.push({
									prop: item.prop,
									width: maxWidth,
								});
							}
						}
					});
				}
			}).then(done, (error: unknown) => {
				done();
				// 此方法是同步公开入口；宽度失败不改变请求结果，也不能遗留 Loading。
				console.error("[Fast:FaTable] 自动宽度计算失败。", error);
			});
			return;
		}
		done();
	};

	const handleTableData = (data: DefaultRow[]): DefaultRow[] => {
		if (props.treeData) {
			const result: DefaultRow[] = [];
			data.forEach((row) => {
				const rowList: unknown = row[props.props.children ?? "children"];
				if (Array.isArray(rowList)) {
					// 如果 rowList 是数组，遍历并合并每个子项
					const childRows: unknown[] = rowList;
					childRows.forEach((childRow) => {
						result.push(typeof childRow === "object" && childRow !== null ? { ...row, ...childRow } : row);
					});
				} else {
					result.push(typeof rowList === "object" && rowList !== null ? { ...row, ...rowList } : row);
				}
			});
			return result;
		} else {
			return data;
		}
	};

	const getRequestParam = (): PagedInput => {
		const params = { ...state.searchParam, ...(props.pagination ? state.tablePagination : {}) };
		// 删除总条数
		delete params.totalRows;
		return params;
	};

	const loadData = async (): Promise<void> => {
		if (disposed) return;
		const currentRequestVersion = ++requestVersion;
		releaseRequest?.();
		const done = loadingTasks.begin();
		releaseRequest = done;
		try {
			if (props.requestApi) {
				const params = getRequestParam();
				emit("refresh", params);
				let pageData: DefaultRow[];
				try {
					const resData = await props.requestApi(params);
					if (disposed || currentRequestVersion !== requestVersion) return;
					// 数据回调
					props.dataCallback?.(resData);
					// 解析 API 接口返回的分页数据（如果有分页更新分页信息）
					if (props.pagination) {
						if (Array.isArray(resData)) {
							pageData = resData;
							state.tablePagination.totalRows = resData.length;
						} else {
							const pageRes = resData as PagedResult;
							pageData = pageRes.rows ?? [];
							Object.assign(state.tablePagination, {
								pageIndex: pageRes.pageIndex ?? state.tablePagination.pageIndex,
								pageSize: pageRes.pageSize ?? state.tablePagination.pageSize,
								totalRows: pageRes.totalRows ?? pageData.length,
							});
						}
					} else {
						pageData = resData as DefaultRow[];
						// 更新分页信息
						Object.assign(state.tablePagination, {
							pageIndex: 1,
							pageSize: 0,
							totalRows: pageData.length,
						});
					}
					state.tableData = handleTableData(pageData);
				} catch (error) {
					if (disposed || currentRequestVersion !== requestVersion) return;
					state.tableData = [];
					throw error;
				}
			} else {
				emit("refresh", { searchValue: state.searchParam.searchValue });
				let _value = handleTableData([...props.data]);
				_value = _value.filter((f) => {
					const searchValue = state.searchParam.searchValue;
					if (typeof searchValue !== "string" || searchValue.length === 0) return true;
					return state.tableColumns.some((col) => {
						const value: unknown = tableUtil.handleRowAccordingToProp(f, col.prop ?? "");
						const text =
							typeof value === "string" || typeof value === "number" || typeof value === "bigint" || typeof value === "boolean"
								? String(value)
								: "";
						return text.toLowerCase().includes(searchValue.toLowerCase());
					});
				});
				if (Array.isArray(state.searchParam.sortList) && state.searchParam.sortList.length > 0) {
					_value = _value.sort(tableUtil.arrayDynamicSort(state.searchParam.sortList));
				}
				if (props.pagination) {
					// 更新分页信息
					Object.assign(state.tablePagination, {
						totalRows: _value.length,
					});
					const pageStart = (state.tablePagination.pageIndex - 1) * state.tablePagination.pageSize;
					const pageEnd = pageStart + state.tablePagination.pageSize;
					state.tableData = _value.slice(pageStart, pageEnd);
				} else {
					state.tableData = _value;
					// 更新分页信息
					Object.assign(state.tablePagination, {
						pageIndex: 1,
						pageSize: 0,
						totalRows: _value.length,
					});
				}
			}
			if (!disposed && currentRequestVersion === requestVersion) handleTableColumnAutoWidth();
		} finally {
			done();
		}
	};

	const cloneColumns = (columns: FaTableColumnCtx[]): FaTableColumnCtx[] =>
		columns.map((column) => ({
			...column,
			...(column.search && { search: { ...column.search, ...(column.search.props && { props: { ...column.search.props } }) } }),
			...(column._children && { _children: cloneColumns(column._children) }),
		}));

	const loadTableColumns = (): void => {
		if (disposed) return;
		let columns: FaTableColumnCtx[] = props.columns ? cloneColumns(props.columns) : [];
		// 默认值处理
		columns.forEach((col) => {
			// 处理搜索项的 key 和 label
			if (col.pureSearch || col.search) {
				col.search ??= { el: "" };
				col.search.key ??= col.prop;
				col.search.label ??= col.label;
				// 处理默认值
				if (col.search.key && col.search.defaultValue !== undefined) {
					state.searchParam[col.search.key] = col.search.defaultValue;
				}
			}
		});

		// 排序
		columns = columns.sort((a, b) => {
			return (a.order ?? 0) - (b.order ?? 0);
		});

		// TODO:这里的扁平化暂时没用到
		state.orgColumns = tableUtil.flatColumns(columns, enumMap);
	};

	const handleSizeChange = (pageSize: number): void => {
		state.tablePagination.pageIndex = 1;
		state.tablePagination.pageSize = pageSize;
		emit("sizeChange", pageSize);
		emit("paginationChange", 1, pageSize);
		loadData();
	};
	const handlePaginationChange = (val: number): void => {
		state.tablePagination.pageIndex = val;
		emit("paginationChange", val, state.tablePagination.pageSize);
		loadData();
	};

	const updatedTotalParam = (): void => {
		// 处理查询参数，可以给查询参数加自定义前缀操作
		const newSearchParam: Record<string, unknown> = {};
		// 防止手动清空输入框携带参数（这里可以自定义查询参数前缀）
		for (const key in state.searchParam) {
			// * 某些情况下参数为 false/0 也应该携带参数
			if (state.searchParam[key] || state.searchParam[key] === false || state.searchParam[key] === 0) {
				newSearchParam[key] = state.searchParam[key];
			}
			// 处理某些情况下如果为空字符串，其实是不需要传到后端的
			else if (!state.searchParam[key]) {
				delete state.searchParam[key];
			}
		}
		Object.assign(state.searchParam, newSearchParam);
	};

	const defaultSearchTime = (): void => {
		if (props.hideSearchTime) {
			state.searchParam.searchTimeList = undefined;
		} else {
			const end = new Date();
			const start = new Date();
			if (props.futureSearchTime) {
				switch (props.dataSearchRange) {
					case "Past1D":
						end.setDate(end.getDate() + 1);
						break;
					case "Past3D":
						end.setDate(end.getDate() + 3);
						break;
					case "Past1W":
						end.setDate(end.getDate() + 7);
						break;
					case "Past1M":
						end.setMonth(end.getMonth() + 1);
						break;
					case "Past3M":
						end.setMonth(end.getMonth() + 3);
						break;
					case "Past6M":
						end.setMonth(end.getMonth() + 6);
						break;
					case "Past1Y":
						end.setFullYear(end.getFullYear() + 1);
						break;
					case "Past3Y":
						end.setFullYear(end.getFullYear() + 3);
						break;
				}
			} else {
				switch (props.dataSearchRange) {
					case "Past1D":
						start.setDate(start.getDate() - 1);
						break;
					case "Past3D":
						start.setDate(start.getDate() - 3);
						break;
					case "Past1W":
						start.setDate(start.getDate() - 7);
						break;
					case "Past1M":
						start.setMonth(start.getMonth() - 1);
						break;
					case "Past3M":
						start.setMonth(start.getMonth() - 3);
						break;
					case "Past6M":
						start.setMonth(start.getMonth() - 6);
						break;
					case "Past1Y":
						start.setFullYear(start.getFullYear() - 1);
						break;
					case "Past3Y":
						start.setFullYear(start.getFullYear() - 3);
						break;
				}
			}
			state.searchParam.searchTimeList = [dayjs(start).format("YYYY-MM-DD 00:00:00"), dayjs(end).format("YYYY-MM-DD 23:59:59")];
		}
	};

	const tableSearch = async (): Promise<void> => {
		if (disposed) return;
		// 重置到第一页
		state.tablePagination.pageIndex = 1;
		updatedTotalParam();
		await loadData();
	};
	const renderTable = debounce((): Promise<void> => {
		loadTableColumns();
		return tableSearch();
	}, 300);

	const tableReset = async (): Promise<void> => {
		if (disposed) return;
		// 重置到第一页
		state.tablePagination.pageIndex = 1;
		// 清除搜索条件
		state.searchParam = {};
		defaultSearchTime();
		// 重置搜索表单的时候，如果有默认搜索参数，则重置默认的搜索参数
		Object.assign(state.searchParam, state.initParam);
		emit("reset", state.searchParam);
		await loadData();
	};

	const doRender = async (): Promise<void> => {
		if (disposed) return;
		// 从重绘请求发出时失效旧结果，而不是等防抖结束后才失效。
		requestVersion++;
		state.orgColumns = [];
		state.autoColumnWidth = [];
		state.tableData = [];
		try {
			await renderTable();
		} catch (error) {
			if (error !== unmountedError) throw error;
		}
	};

	// 供公开 loading 的 setter 使用，不单独暴露为组件方法。
	const setManualLoading = (loading: boolean): void => {
		if (disposed) return;
		if (loading) {
			releaseManual ??= loadingTasks.begin();
		} else {
			releaseManual?.();
			releaseManual = undefined;
		}
	};

	const doLoading = async (loadingFunction: () => void | Promise<void>, loadingText = "加载中..."): Promise<void> => {
		if (disposed) return;
		const done = loadingTasks.begin(loadingText);
		try {
			await callOptionalFunction(loadingFunction);
		} finally {
			done();
		}
	};

	const handleCustomCellClick = (
		emitName: string,
		{ row, column, $index }: { row: DefaultRow; column: FaTableColumnCtx; $index: number }
	): void => {
		emit("customCellClick", emitName, { row, column, $index, ...getTableDefaultSlots(state) });
	};

	watch(
		() => props.tableKey,
		() => doRender()
	);

	watch(
		() => props.searchForm,
		(newValue) => {
			state.searchForm = newValue;
		}
	);

	onBeforeUnmount(() => {
		disposed = true;
		requestVersion++;
		widthVersion++;
		renderTable.cancel(unmountedError);
		loadingTasks.dispose();
	});

	return {
		globalSize,
		state,
		elementRef,
		tableRef,
		handleTableColumnAutoWidth,
		getRequestParam,
		loadTableColumns,
		handleSizeChange,
		handlePaginationChange,
		defaultSearchTime,
		tableSearch,
		tableReset,
		doRender,
		setManualLoading,
		doLoading,
		handleCustomCellClick,
	};
};
