import { Fragment, computed, defineComponent, onActivated, onBeforeUnmount, onMounted, shallowRef, watch, watchEffect } from "vue";
import { Eleme, More, Refresh, Search, Setting } from "@element-plus/icons-vue";
import {
	ElButton,
	ElDatePicker,
	ElDropdown,
	ElDropdownItem,
	ElDropdownMenu,
	ElIcon,
	ElImageViewer,
	ElInput,
	ElPagination,
	ElTable,
	ElTableColumn,
} from "element-plus";
import { NotData } from "@fast-element-plus/icons-vue";
import { tableProps } from "../../../internal/props";
import {
	createDateRangeShortcuts,
	createOneMonthRangeFromToday,
	debounce,
	definePropType,
	makeSlots,
	omit,
	pick,
	randomString,
	useExpose,
	useProps,
	useRender,
} from "../../../utils";
import { tableUtil } from "../utils/table";
import { getTableDefaultSlots } from "./table.type";
import FaTableColumn from "./tableColumn";
import FaTableColumnsSettingDialog from "./tableColumnSettingDialog";
import FaTablePagination from "./tablePagination";
import FaTableSearchForm from "./tableSearchForm";
import { useTable } from "./useTable";
import type { TableColumnCtx, TableProps } from "element-plus";
import type { PropType } from "vue";
import type { FaLayoutGridBreakpoint } from "../../layoutGrid";
import type { PagedInput, PagedResult, PagedSortInput } from "../src/page.type";
import type { DefaultRow } from "./table.state";
import type { FaTableColumnCtx, FaTableDataRange, FaTableDefaultSlotsResult } from "./table.type";

export { tableProps } from "../../../internal/props";
export type { TreeProps } from "../../../internal/props";

/** FaTable 的运行时 Props 定义 */
export const faTableProps = {
	...tableProps,
	/** whether Table has vertical border */
	border: {
		type: Boolean,
		default: true,
	},
	/** whether current row is highlighted */
	highlightCurrentRow: {
		type: Boolean,
		default: true,
	},
	/** key of row data, used for optimizing rendering. Required if `reserve-selection` is on or display tree data. When its type is String, multi-level access is supported, e.g. `user.info.id`, but `user.info[0].id` is not supported, in which case `Function` should be used */
	rowKey: {
		type: [String, Function] as PropType<NonNullable<TableProps<DefaultRow>["rowKey"]>>,
		default: "id",
	},
	/** 组件封装，原生的已经失效 method that returns rowspan and colspan */
	spanMethod: {
		type: Function as PropType<TableProps<DefaultRow>["spanMethod"]>,
		validator: () => {
			console.warn("[Fast:FaTable]", "'spanMethod' 属性，组件已经封装，外部使用会失效。");
			return false;
		},
	},
	/** 表格Key */
	tableKey: {
		type: String,
		default: () => randomString(8),
	},
	/** 表格数据 */
	data: {
		type: definePropType<DefaultRow[]>(Array),
		default: () => [],
	},
	/** 请求数据的函数 */
	requestApi: {
		type: definePropType<(params?: PagedInput) => Promise<PagedResult<DefaultRow> | DefaultRow[]>>(Function),
	},
	/** 接口请求数据回调 */
	dataCallback: {
		type: definePropType<(data: PagedResult<DefaultRow> | DefaultRow[]) => void>(Function),
	},
	/** 初始化参数 */
	initParam: definePropType<string | number | PagedInput | null>([String, Number, Object]),
	/** 列配置 */
	columns: {
		type: definePropType<FaTableColumnCtx[] | false>([Array, Boolean]),
		default: () => false,
	},
	/** 表格列改变 */
	columnsChange: {
		type: definePropType<(columns: FaTableColumnCtx[]) => Promise<void>>(Function),
	},
	/** 搜索表单 Grid布局列配置 */
	searchFormCols: {
		type: definePropType<string | number | Record<FaLayoutGridBreakpoint, number>>([String, Number, Object]),
		default: () => ({ xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }),
	},
	/** 折叠搜索 */
	collapsedSearch: {
		type: Boolean,
		default: true,
	},
	/** 高级搜索抽屉 */
	advancedSearchDrawer: {
		type: Boolean,
		default: false,
	},
	/** 搜索表单 */
	searchForm: {
		type: Boolean,
		default: true,
	},
	/** 头部卡片 */
	headerCard: {
		type: Boolean,
		default: true,
	},
	/** 刷新按钮 */
	refreshBtn: {
		type: Boolean,
		default: true,
	},
	/** 搜索按钮 */
	searchBtn: {
		type: Boolean,
		default: true,
	},
	/** 列配置按钮 */
	columnSettingBtn: {
		type: Boolean,
		default: false,
	},
	/** 头部卡片右侧功能按钮 */
	toolBtn: {
		type: Boolean,
		default: true,
	},
	/** 隐藏搜索时间 */
	hideSearchTime: Boolean,
	/** 未来搜索时间 */
	futureSearchTime: Boolean,
	/** 搜索时间范围 */
	dataSearchRange: {
		type: definePropType<FaTableDataRange>(String),
		default: "Past3D",
	},
	/** 选择列 */
	selectionColumn: Boolean,
	/** 序号列 */
	indexColumn: {
		type: Boolean,
		default: true,
	},
	/** 分页 */
	pagination: {
		type: Boolean,
		default: true,
	},
	/** 页码 */
	pageSizes: {
		type: definePropType<number[]>(Array),
		default: [20, 30, 50, 100],
	},
	/** 隐藏图片 */
	hideImage: Boolean,
	/** 单选 */
	single: Boolean,
	/** 行点击选择 */
	rowClickSelection: Boolean,
	/** 将父级数据的 children 展开为表格行，并把父级字段合并到子项；Element Plus 树表无需启用 */
	treeData: Boolean,
	/** 配置选项 */
	props: {
		type: definePropType<{ span?: string; children?: string }>(Object),
		default: () => ({
			span: undefined,
			children: "children",
		}),
	},
	/** 自动刷新，当传入 data 时候，如果存在更改则自动刷新 */
	autoRefresh: {
		type: Boolean,
		default: true,
	},
	/**
	 * 等价于 Table-Column 的 selectable
	 * function that determines if a certain row can be selected, works when `type` is 'selection'
	 */
	rowSelectable: Function as PropType<TableColumnCtx<DefaultRow>["selectable"]>,
};

/** FaTable 的运行时 Emits 定义 */
export const faTableEmits = {
	/** 当用户手动勾选数据行的 Checkbox 时触发的事件 */
	select: (selection: DefaultRow[], row: DefaultRow) => Array.isArray(selection) && typeof row === "object" && row !== null,
	/** 当用户手动勾选全选 Checkbox 时触发的事件 */
	selectAll: (selection: DefaultRow[]) => Array.isArray(selection),
	/** 当选择项发生变化时会触发该事件 */
	selectionChange: (newSelection: DefaultRow[]) => Array.isArray(newSelection),
	/** 当单元格 hover 进入时会触发该事件 */
	cellMouseEnter: (row: DefaultRow, column: TableColumnCtx<DefaultRow>, cell: HTMLTableCellElement, event: Event) =>
		typeof row === "object" &&
		row !== null &&
		typeof column === "object" &&
		column !== null &&
		cell instanceof HTMLTableCellElement &&
		event instanceof Event,
	/** 当单元格 hover 退出时会触发该事件 */
	cellMouseLeave: (row: DefaultRow, column: TableColumnCtx<DefaultRow>, cell: HTMLTableCellElement, event: Event) =>
		typeof row === "object" &&
		row !== null &&
		typeof column === "object" &&
		column !== null &&
		cell instanceof HTMLTableCellElement &&
		event instanceof Event,
	/** 当某个单元格被点击时会触发该事件 */
	cellClick: (row: DefaultRow, column: TableColumnCtx<DefaultRow>, cell: HTMLTableCellElement, event: Event) =>
		typeof row === "object" &&
		row !== null &&
		typeof column === "object" &&
		column !== null &&
		cell instanceof HTMLTableCellElement &&
		event instanceof Event,
	/** 当某个单元格被双击击时会触发该事件 */
	cellDblclick: (row: DefaultRow, column: TableColumnCtx<DefaultRow>, cell: HTMLTableCellElement, event: Event) =>
		typeof row === "object" &&
		row !== null &&
		typeof column === "object" &&
		column !== null &&
		cell instanceof HTMLTableCellElement &&
		event instanceof Event,
	/** 当某个单元格被鼠标右键点击时会触发该事件 */
	cellContextmenu: (row: DefaultRow, column: TableColumnCtx<DefaultRow>, cell: HTMLTableCellElement, event: Event) =>
		typeof row === "object" &&
		row !== null &&
		typeof column === "object" &&
		column !== null &&
		cell instanceof HTMLTableCellElement &&
		event instanceof Event,
	/** 当某一行被点击时会触发该事件 */
	rowClick: (row: DefaultRow, column: TableColumnCtx<DefaultRow>, event: Event) =>
		typeof row === "object" && row !== null && typeof column === "object" && column !== null && event instanceof Event,
	/** 当某一行被鼠标右键点击时会触发该事件 */
	rowContextmenu: (row: DefaultRow, column: TableColumnCtx<DefaultRow>, event: Event) =>
		typeof row === "object" && row !== null && typeof column === "object" && column !== null && event instanceof Event,
	/** 当某一行被双击时会触发该事件 */
	rowDblclick: (row: DefaultRow, column: TableColumnCtx<DefaultRow>, event: Event) =>
		typeof row === "object" && row !== null && typeof column === "object" && column !== null && event instanceof Event,
	/** 当某一列的表头被点击时会触发该事件 */
	headerClick: (column: TableColumnCtx<DefaultRow>, event: Event) => typeof column === "object" && column !== null && event instanceof Event,
	/** 当某一列的表头被鼠标右键点击时触发该事件 */
	headerContextmenu: (column: TableColumnCtx<DefaultRow>, event: Event) => typeof column === "object" && column !== null && event instanceof Event,
	/** 当表格的排序条件发生变化的时候会触发该事件 */
	sortChange: (data: { column: TableColumnCtx<DefaultRow>; prop: string; order: "" | "ascending" | "descending" }) =>
		typeof data === "object" && data !== null,
	/** column 的 key， 如果需要使用 filter-change 事件，则需要此属性标识是哪个 column 的筛选条件 */
	filterChange: (newFilters: Record<string, string[]>) => typeof newFilters === "object" && newFilters !== null,
	/** 当表格的当前行发生变化的时候会触发该事件，如果要高亮当前行，请打开表格的 highlight-current-row 属性 */
	currentChange: (currentRow: DefaultRow, oldCurrentRow: DefaultRow | null) =>
		typeof currentRow === "object" &&
		currentRow !== null &&
		(oldCurrentRow === null || (typeof oldCurrentRow === "object" && oldCurrentRow !== null)),
	/** 当拖动表头改变了列的宽度的时候会触发该事件 */
	headerDragend: (newWidth: number, oldWidth: number, column: TableColumnCtx<DefaultRow>, event: MouseEvent) =>
		typeof newWidth === "number" && typeof oldWidth === "number" && typeof column === "object" && column !== null && event instanceof MouseEvent,
	/** 当用户对某一行展开或者关闭的时候会触发该事件（展开行时，回调的第二个参数为 expandedRows；树形表格时第二参数为 expanded） */
	expandChange: (row: DefaultRow, expanded: boolean | DefaultRow[]) =>
		typeof row === "object" && row !== null && (typeof expanded === "boolean" || Array.isArray(expanded)),
	/** 表格滚动时触发 */
	scroll: (data: { scrollLeft: number; scrollTop: number }) => typeof data === "object" && data !== null,

	/** 表格刷新事件 */
	refresh: (params: PagedInput) => typeof params === "object" && params !== null,
	/** 表格重置事件 */
	reset: (params: PagedInput) => typeof params === "object" && params !== null,
	/** 分页页码改变事件 */
	sizeChange: (pageSize: number) => typeof pageSize === "number",
	/** 分页改变事件 */
	paginationChange: (pageIndex: number, pageSize: number) => typeof pageIndex === "number" && typeof pageSize === "number",
	/** 自定义单元格点击事件 */
	customCellClick: (
		emitName: string,
		{ row, column, $index }: { row: DefaultRow; column: FaTableColumnCtx; $index: number } & FaTableDefaultSlotsResult
	) =>
		(emitName == null || typeof emitName === "string") &&
		typeof row === "object" &&
		row !== null &&
		typeof column === "object" &&
		column !== null &&
		typeof $index === "number",
};

/** FaTable 的插槽参数 */
export type FaTableSlots = Record<string, unknown> & {
	/** 默认内容插槽 */
	default: never;
	/** 插入至表格最后一行之后的内容， 如果需要对表格的内容进行无限滚动操作，可能需要用到这个 slot。 若表格有合计行，该 slot 会位于合计行之上。 */
	append: never;
	/** 当数据为空时自定义的内容 */
	empty: never;
	/** 表格顶部插槽 */
	topHeader: FaTableDefaultSlotsResult;
	/** 表格头部左侧插槽 */
	header: FaTableDefaultSlotsResult;
	/** 表格头部右侧功能按钮插槽 */
	toolButton: FaTableDefaultSlotsResult;
	/** 表格头部右侧高级操作按钮插槽，ElDropdownMenuItem 标签 */
	toolButtonAdv: FaTableDefaultSlotsResult;
	/** 表格展开列插槽 */
	expand: FaTableDefaultSlotsResult & {
		row: DefaultRow;
		column: TableColumnCtx<DefaultRow>;
		$index: number;
	};
	/** 表格操作列插槽 */
	operation: FaTableDefaultSlotsResult & {
		row: DefaultRow;
		column: FaTableColumnCtx;
		$index: number;
	};
	/** 表格分页插槽 */
	pagination: {
		pageIndex: number;
		pageSize: number;
		totalRows: number;
		handleSizeChange: (val: number) => void;
		handlePaginationChange: (val: number) => void;
	};
	/** 表格页脚插槽 */
	footer: FaTableDefaultSlotsResult;
	/** 列配置 */
	columnSetting: never;
} & Record<
		string,
		FaTableDefaultSlotsResult & {
			/** slots为表格内容的时候才会返回 */
			row?: DefaultRow;
			/** slot为表头内容的时候返回 'TableColumnCtx<DefaultRow>' 否则返回 'FaTableColumnCtx' */
			column?: TableColumnCtx<DefaultRow> | FaTableColumnCtx;
			/** slot为非搜索项的时候才会返回 */
			$index?: number;
			/** slot为搜索项的时候才会返回 */
			search?: () => Promise<void>;
		}
	>;

export default defineComponent({
	name: "FaTable",
	props: faTableProps,
	emits: faTableEmits,
	slots: makeSlots<FaTableSlots>(),
	setup(props, { slots, emit, expose }) {
		const columnSettingRef = shallowRef<InstanceType<typeof FaTableColumnsSettingDialog> | null>(null);

		const {
			globalSize,
			state,
			elementRef,
			tableRef,
			handleTableColumnAutoWidth,
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
		} = useTable(props, slots, emit);

		const notifyColumnsChange = debounce(() => props.columnsChange?.(state.orgColumns), 500);
		const resizeTableColumns = debounce(handleTableColumnAutoWidth, 100);

		const unmountedError = new Error("FaTable 已卸载，列布局任务已取消。");
		const reportColumnTask = (task: Promise<unknown>) => {
			task.catch((error: unknown) => {
				if (error !== unmountedError) console.error("FaTable 列更新失败。", error);
			});
		};

		let lastRowIndex = 0;
		const getInitParam = (): Record<string, unknown> => {
			return typeof props.initParam === "object" && props.initParam !== null ? props.initParam : {};
		};
		const getRowKey = (row: DefaultRow) => {
			const value: unknown = typeof props.rowKey === "function" ? props.rowKey(row) : tableUtil.handleRowAccordingToProp(row, props.rowKey);
			return typeof value === "string" || typeof value === "number" ? value : undefined;
		};

		const indexMethod = (index: number) => {
			if (index === 0) {
				lastRowIndex = 0;
			}
			if (state.spanColumns.length > 0) {
				const rowspan = state.tableSpanData["__table-index"]?.[index] ?? 0;
				if (rowspan === 0) {
					return lastRowIndex + (state.tablePagination.pageIndex - 1) * state.tablePagination.pageSize + 1;
				} else {
					lastRowIndex++;
					return lastRowIndex + (state.tablePagination.pageIndex - 1) * state.tablePagination.pageSize;
				}
			}
			return index + (state.tablePagination.pageIndex - 1) * state.tablePagination.pageSize + 1;
		};

		const handleSelect = (selection: DefaultRow[], row: DefaultRow) => {
			// 判断是否开启了单选
			if (props.single) {
				tableRef.value?.clearSelection();
				if (selection.length > 0) {
					tableRef.value?.toggleRowSelection(row);
				}
			}
			emit("select", selection, row);
		};

		const handleSelectAll = (selection: DefaultRow[]) => {
			if (props.single) {
				// 判断是否已经选中数据
				if (state.selected) {
					// 默认选中的第一行
					if (state.tableData.length > 0) {
						tableRef.value?.clearSelection();
						const firstRow = state.tableData[0];
						if (firstRow) tableRef.value?.toggleRowSelection(firstRow);
					}
				} else {
					tableRef.value?.clearSelection();
				}
			}
			emit("selectAll", selection);
		};

		const handleSelectionChange = (newSelection: DefaultRow[]) => {
			newSelection.length === 0 ? (state.selected = false) : (state.selected = true);
			// 判断是否为单选
			if (props.single && newSelection.length > 0) {
				// 这里获取最后一个是因为选中改变的事件会触发多次，会带入旧的数据
				const lastSelection = newSelection.at(-1);
				state.selectedList = lastSelection === undefined ? [] : [lastSelection];
			} else {
				state.selectedList = newSelection;
			}
			// 如果已经取消选择了，那么部分选择也应该要取消
			state.indeterminateSelectedListIds = state.indeterminateSelectedListIds.filter((f) => state.selectedListIds.some((s) => s === f));
			emit("selectionChange", state.selectedList);
		};

		const toggleRowIndeterminateSelection = (row: DefaultRow, selected?: boolean) => {
			const rowKey = getRowKey(row);
			if (rowKey === undefined) return;
			const curRow = state.tableData.find((item) => getRowKey(item) === rowKey);
			if (selected === true) {
				if (!state.indeterminateSelectedListIds.some((s) => s === rowKey)) {
					state.indeterminateSelectedListIds.push(rowKey);
				}
				if (curRow) tableRef.value?.toggleRowSelection(curRow, true);
			} else if (selected === false) {
				const fIndex = state.indeterminateSelectedListIds.findIndex((f) => f === rowKey);
				if (fIndex >= 0) {
					state.indeterminateSelectedListIds.splice(fIndex, 1);
				}
				if (curRow) tableRef.value?.toggleRowSelection(curRow, false);
			} else {
				const fIndex = state.indeterminateSelectedListIds.findIndex((f) => f === rowKey);
				if (fIndex >= 0) {
					state.indeterminateSelectedListIds.splice(fIndex, 1);
				} else {
					state.indeterminateSelectedListIds.push(rowKey);
				}
				if (curRow) tableRef.value?.toggleRowSelection(curRow);
			}
		};

		const handleSortChange = ({
			column,
			prop,
		}: {
			column: TableColumnCtx<DefaultRow> & { multiOrder?: "" | "ascending" | "descending" };
			prop: string | null;
			order: "" | "ascending" | "descending" | null;
		}) => {
			const normalizedProp = prop ?? column.property;
			if (!column.multiOrder) {
				column.multiOrder = "descending";
			} else if (column.multiOrder === "descending") {
				column.multiOrder = "ascending";
			} else {
				column.multiOrder = undefined;
			}
			// 排序集合非空判断
			const initSortList: unknown = getInitParam()["sortList"];
			state.searchParam.sortList = [
				...(Array.isArray(initSortList) ? (initSortList as PagedSortInput[]) : []),
				...(state.searchParam.sortList ?? []),
			].filter((item, index, list) => list.findIndex((candidate) => candidate.enField === item.enField) === index);

			// 去原来的列中查找表格的列数据
			const orgColumn = state.orgColumns.find((f) => f.prop === normalizedProp);
			const enField = orgColumn?.sortableField ?? orgColumn?.prop ?? column.property;
			const fieldIndex = state.searchParam.sortList.findIndex((f: PagedSortInput) => f.enField === enField);
			if (!column.multiOrder && fieldIndex >= 0) {
				// 如果是空的，删除排序
				state.searchParam.sortList.splice(fieldIndex, 1);
			} else if (fieldIndex === -1) {
				state.searchParam.sortList.push({
					enField,
					cnField: column.label,
					mode: column.multiOrder,
				});
			} else {
				const sortItem = state.searchParam.sortList[fieldIndex];
				if (sortItem) sortItem.mode = column.multiOrder;
			}
			// 判断最后的排序集合中是否还存在数据，如果不存在，则删除排序集合
			if (state.searchParam.sortList.length === 0) {
				delete state.searchParam.sortList;
			}
			emit("sortChange", { column, prop: normalizedProp, order: column.multiOrder ?? "" });
			tableSearch();
		};

		const handleCurrentChange = (currentRow: DefaultRow | null, oldCurrentRow: DefaultRow | null) => {
			if (!currentRow) {
				// 这里为空的时候，会导致 Header 中的不确定状态还是true的状态
				// tableRef.value.clearSelection();
				return;
			}
			if (props.rowClickSelection) {
				// 判断是否为单选
				if (props.single && oldCurrentRow) {
					tableRef.value?.toggleRowSelection(oldCurrentRow);
				}
				tableRef.value?.toggleRowSelection(currentRow);
			}
			emit("currentChange", currentRow, oldCurrentRow);
		};

		const handleCellClassName = ({
			row,
			column,
			rowIndex,
			columnIndex,
		}: {
			row: DefaultRow;
			column: TableColumnCtx<DefaultRow>;
			rowIndex: number;
			columnIndex: number;
		}) => {
			let localCellClassName = "";
			// 判断是否为选择列
			if (column.type === "selection") {
				// 判断是否在部分选中的集合中
				const rowKey = getRowKey(row);
				if (state.indeterminateSelectedListIds.some((s) => s === rowKey)) {
					localCellClassName = "fa-table__selection-column__indeterminate";
				}
			}
			const columnInfo = state.tableColumns.find((f) => f.prop === column.property);
			if (columnInfo?.dataDeleteField) {
				if (row[columnInfo.dataDeleteField] === true) {
					if (localCellClassName) {
						localCellClassName += " fa-table__data-delete-column";
					} else {
						localCellClassName = "fa-table__data-delete-column";
					}
				}
			}
			if (props.cellClassName) {
				const cellClassName =
					typeof props.cellClassName === "string" ? props.cellClassName : props.cellClassName({ row, column, rowIndex, columnIndex });
				if (!cellClassName) {
					return localCellClassName;
				}
				if (localCellClassName) {
					return `${localCellClassName} ${cellClassName}`;
				} else {
					return cellClassName;
				}
			} else {
				return localCellClassName;
			}
		};

		const handleHeaderCellClassName = ({
			row,
			column,
			rowIndex,
			columnIndex,
		}: {
			row: DefaultRow;
			column: TableColumnCtx<DefaultRow> & { multiOrder?: "" | "ascending" | "descending" };
			rowIndex: number;
			columnIndex: number;
		}) => {
			// TODO：不晓得这里有无问题，EL 更新了还未测试
			column.order = column.multiOrder === "ascending" || column.multiOrder === "descending" ? column.multiOrder : null;
			if (props.headerCellClassName) {
				if (typeof props.headerCellClassName === "function") {
					return props.headerCellClassName({ row, column, rowIndex, columnIndex });
				} else {
					return props.headerCellClassName;
				}
			}
			return "";
		};

		const handleSpanMethod = ({
			column,
			rowIndex,
		}: {
			row: DefaultRow;
			column: TableColumnCtx<DefaultRow>;
			rowIndex: number;
			columnIndex: number;
		}) => {
			/** 原生的 span-method 会失效 */
			const property = column.property as string | null | undefined;
			const columnKey = column.columnKey as string | null | undefined;
			const pKey = property ?? columnKey;
			if (pKey === undefined || pKey === null) return { rowspan: 1, colspan: 1 };
			if (state.spanColumns.findIndex((f) => f.prop === pKey) !== -1) {
				const rowspan = state.tableSpanData[pKey]?.[rowIndex] ?? 0;
				if (rowspan > 0) {
					return { rowspan, colspan: 1 };
				}
				return { rowspan: 0, colspan: 0 };
			}
			return { rowspan: 1, colspan: 1 };
		};

		const handleHeaderDragend = (newWidth: number, oldWidth: number, column: TableColumnCtx<DefaultRow>, event: MouseEvent) => {
			state.orgColumns.forEach((f) => {
				if (column.property === f.prop) {
					f.width = newWidth;
					f.smallWidth = newWidth;
				}
			});
			emit("headerDragend", newWidth, oldWidth, column, event);
			if (props.columnsChange) reportColumnTask(notifyColumnsChange());
		};

		const handleImagePreview = (url: string) => {
			state.previewList = [url];
			state.imagePreview = true;
		};

		const tableColumnOmitNames = ["multiOrder", "columnId", "order", "sortableField", "disabledSortable", "spanProp", "pureSearch", "search"];
		const searchFormSlotNames = computed(() => [
			...new Set(state.searchColumns.flatMap((column) => (typeof column.search?.slot === "string" ? [column.search.slot] : []))),
		]);
		const tableColumnSlotNames = computed(() => [
			...new Set(state.tableColumns.flatMap((column) => [column.slot, column.headerSlot].filter((name) => typeof name === "string"))),
		]);
		const searchInputClearable = computed(() => {
			const value = state.searchParam.searchValue;
			return (value !== undefined && value !== "") || state.searchValueUpdate.length > 0;
		});

		watch(
			() => props.columns,
			() => {
				loadTableColumns();
			},
			{ deep: true }
		);

		watch(
			() => props.initParam,
			() => {
				// 如果初始化参数改变了，则需要改变对应的搜索参数
				Object.entries(getInitParam()).forEach(([key, value]) => {
					state.searchParam[key] = value;
				});
			},
			{ deep: true }
		);

		watch(
			() => props.data,
			() => {
				if (!props.requestApi && props.autoRefresh) {
					return tableSearch();
				}
			},
			{ deep: true }
		);

		watchEffect((onCleanup) => {
			const element = elementRef.value;
			if (element) {
				const observer = new ResizeObserver((entries) => {
					for (const entry of entries) {
						const { width, height } = entry.contentRect;
						const widthChanged = state.tableWidth !== width;
						state.tableWidth = width;
						state.tableHeight = height;
						if (widthChanged) reportColumnTask(resizeTableColumns());
					}
				});
				observer.observe(element);

				onCleanup(() => observer.disconnect());
			}
		});

		onBeforeUnmount(() => {
			notifyColumnsChange.cancel(unmountedError);
			resizeTableColumns.cancel(unmountedError);
		});

		onMounted(async () => {
			state.initParam = getInitParam();
			defaultSearchTime();
			// 初始化搜索表单的时候，如果有默认搜索参数，则重置默认的搜索参数
			Object.entries(getInitParam()).forEach(([key, value]) => {
				state.searchParam[key] = value;
			});
			await tableSearch();
			loadTableColumns();
			if (!props.requestApi && props.autoRefresh) await tableSearch();
		});

		onActivated(() => {
			// 解决 keep-alive 后自动列宽失效的问题
			handleTableColumnAutoWidth();
		});

		const elTableProps = useProps(props, tableProps, ["data", "spanMethod", "headerCellClassName", "cellClassName"]);

		useRender(() => (
			<div
				ref={elementRef}
				class={["fa-table", `fa-table-${globalSize.value}`, `fa-table__${props.tableKey}`, { fa__click__disabled: state.loading }]}
				style={{
					"--fa-table-width": state.tableWidth ? `${state.tableWidth}px` : "",
					"--fa-table-height": state.tableHeight ? `${state.tableHeight}px` : "",
				}}
			>
				<FaTableSearchForm
					vSlots={pick(slots, searchFormSlotNames.value)}
					show={props.searchForm && state.searchForm}
					collapsedSearch={props.collapsedSearch}
					advancedSearchDrawer={props.advancedSearchDrawer}
					cols={props.searchFormCols}
					search={tableSearch}
					reset={tableReset}
				/>
				{slots.topHeader && (
					<div class="el-card fa-table__header">{slots.topHeader({ search: tableSearch, ...getTableDefaultSlots(state) })}</div>
				)}
				<div
					class="el-card fa-table__main"
					style={{
						containerType: slots.expand ? "inline-size" : undefined,
					}}
				>
					{props.headerCard && (
						<div class="fa-table__main-header">
							<div class="fa-table__main-header-left">{slots.header?.({ search: tableSearch, ...getTableDefaultSlots(state) })}</div>
							<div class="fa-table__main-header-right">
								{props.toolBtn && (
									<Fragment>
										<div class="fa-table__main-header-right__div-search">
											<ElInput
												class="fa-table__main-header-right__input-search"
												disabled={state.loading}
												prefixIcon={Search}
												placeholder="关键字搜索"
												vModel_trim={state.searchParam.searchValue}
												clearable={searchInputClearable.value}
												onCompositionupdate={(e: CompositionEvent) => {
													state.searchValueUpdate = e.data;
												}}
												onCompositionend={() => {
													state.searchValueUpdate = "";
												}}
												onChange={tableSearch}
											/>
											<div class="fa-table__main-header-right__div-search__hidden">
												{state.searchParam.searchValue}
												{state.searchValueUpdate}
											</div>
										</div>
										{props.requestApi && !props.hideSearchTime && (
											<ElDatePicker
												{...{
													// ElDatePicker 的 JSX 类型未声明 change 事件，运行时由内部 Picker 触发。
													onChange: tableSearch,
												}}
												class="fa-table__main-header-right__data-search"
												popperClass="fa-table__main-header-right__data-search__popper"
												disabled={state.loading}
												type="daterange"
												vModel={state.searchParam.searchTimeList}
												defaultTime={createOneMonthRangeFromToday(props.futureSearchTime)}
												shortcuts={createDateRangeShortcuts(props.futureSearchTime)}
												valueFormat="YYYY-MM-DD HH:mm:ss"
												clearable={false}
												placement="bottom"
												fallbackPlacements={["top"]}
												unlinkPanels
											/>
										)}
										{props.refreshBtn && (
											<ElButton
												loading={state.loading}
												loadingIcon={Eleme}
												title="刷新"
												circle
												icon={Refresh}
												onClick={tableSearch}
											/>
										)}
										{props.searchBtn && state.searchColumns.length > 0 && (
											<ElButton
												loading={state.loading}
												loadingIcon={Eleme}
												title={state.searchForm ? "隐藏搜索栏" : "显示搜索栏"}
												circle
												icon={Search}
												onClick={() => (state.searchForm = !state.searchForm)}
											/>
										)}
										{props.columnSettingBtn && props.columns && (
											<ElDropdown title="表格列配置" trigger="click">
												{{
													default: () => <ElButton loading={state.loading} loadingIcon={Eleme} circle icon={Setting} />,
													dropdown: () => (
														<ElDropdownMenu>
															{slots.columnSetting?.()}
															<ElDropdownItem title="表格列配置" divided onClick={() => columnSettingRef.value?.open()}>
																表格列配置
															</ElDropdownItem>
														</ElDropdownMenu>
													),
												}}
											</ElDropdown>
										)}
										{slots.toolButton?.({ search: tableSearch, ...getTableDefaultSlots(state) })}
										{slots.toolButtonAdv && (
											<ElDropdown title="高级操作" trigger="click">
												{{
													default: () => (
														<ElButton loading={state.loading} loadingIcon={Eleme} circle icon={More}></ElButton>
													),
													dropdown: () => (
														<ElDropdownMenu>
															{slots.toolButtonAdv?.({ search: tableSearch, ...getTableDefaultSlots(state) })}
														</ElDropdownMenu>
													),
												}}
											</ElDropdown>
										)}
									</Fragment>
								)}
							</div>
						</div>
					)}
					<ElTable
						{...elTableProps.value}
						ref={tableRef}
						vLoading={state.loading}
						element-loading-text={state.loadingText}
						data={state.tableData}
						spanMethod={handleSpanMethod}
						headerCellClassName={handleHeaderCellClassName}
						cellClassName={handleCellClassName}
						onSelection-change={handleSelectionChange}
						onSort-change={handleSortChange}
						onSelect={handleSelect}
						onSelect-all={handleSelectAll}
						onCurrent-change={handleCurrentChange}
						onHeader-dragend={handleHeaderDragend}
						onCell-mouse-enter={(row: DefaultRow, column: TableColumnCtx<DefaultRow>, cell: HTMLTableCellElement, event: Event) =>
							emit("cellMouseEnter", row, column, cell, event)
						}
						onCell-mouse-leave={(row: DefaultRow, column: TableColumnCtx<DefaultRow>, cell: HTMLTableCellElement, event: Event) =>
							emit("cellMouseLeave", row, column, cell, event)
						}
						onCell-click={(row: DefaultRow, column: TableColumnCtx<DefaultRow>, cell: HTMLTableCellElement, event: Event) =>
							emit("cellClick", row, column, cell, event)
						}
						onCell-dblclick={(row: DefaultRow, column: TableColumnCtx<DefaultRow>, cell: HTMLTableCellElement, event: Event) =>
							emit("cellDblclick", row, column, cell, event)
						}
						onCell-contextmenu={(row: DefaultRow, column: TableColumnCtx<DefaultRow>, cell: HTMLTableCellElement, event: Event) =>
							emit("cellContextmenu", row, column, cell, event)
						}
						onRow-click={(row: DefaultRow, column: TableColumnCtx<DefaultRow> | null, event: Event) => {
							if (column) emit("rowClick", row, column, event);
						}}
						onRow-contextmenu={(row: DefaultRow, column: TableColumnCtx<DefaultRow> | null, event: Event) => {
							if (column) emit("rowContextmenu", row, column, event);
						}}
						onRow-dblclick={(row: DefaultRow, column: TableColumnCtx<DefaultRow> | null, event: Event) => {
							if (column) emit("rowDblclick", row, column, event);
						}}
						onHeader-click={(column: TableColumnCtx<DefaultRow>, event: Event) => emit("headerClick", column, event)}
						onHeader-contextmenu={(column: TableColumnCtx<DefaultRow>, event: Event) => emit("headerContextmenu", column, event)}
						onFilter-change={(newFilters: Record<string, string[]>) => emit("filterChange", newFilters)}
						onExpand-change={(row: DefaultRow, expanded: boolean | DefaultRow[]) => emit("expandChange", row, expanded)}
						onScroll={(data: { scrollLeft: number; scrollTop: number }) => emit("scroll", data)}
					>
						{{
							append: () => slots.append?.(),
							empty: () => (
								<div class="fa-table__empty">
									{slots.empty ? (
										slots.empty()
									) : (
										<Fragment>
											<ElIcon>
												<NotData />
											</ElIcon>
											<div>暂无数据</div>
										</Fragment>
									)}
								</div>
							),
							default: () => (
								<Fragment>
									{slots.expand && (
										<ElTableColumn
											className="fa-table__expand-column"
											type="expand"
											fixed="left"
											width={35}
											align="center"
											showOverflowTooltip={false}
											resizable={false}
											columnKey="__table-expand"
										>
											{{
												default: ({
													row,
													column,
													$index,
												}: {
													row: DefaultRow;
													column: TableColumnCtx<DefaultRow>;
													$index: number;
												}) => (
													<div
														class="fa-table__expand-wrapper"
														style={{
															boxSizing: "border-box",
															width: "100cqw",
															padding: globalSize.value === "small" ? "12px" : "16px",
														}}
													>
														{slots.expand?.({
															row,
															column,
															$index,
															search: tableSearch,
															...getTableDefaultSlots(state),
														})}
													</div>
												),
											}}
										</ElTableColumn>
									)}
									{props.selectionColumn && (
										<ElTableColumn
											className="fa-table__selection-column"
											type="selection"
											fixed="left"
											width={35}
											align="center"
											reserveSelection
											showOverflowTooltip={false}
											resizable={false}
											columnKey="__table-selection"
											selectable={props.rowSelectable}
										/>
									)}
									{props.indexColumn && (
										<ElTableColumn
											className="fa-table__index-column"
											type="index"
											fixed="left"
											width={
												state.tablePagination.pageIndex * state.tablePagination.pageSize >= 100
													? state.tablePagination.pageIndex * state.tablePagination.pageSize >= 1000
														? 50
														: 40
													: 30
											}
											align="center"
											index={indexMethod}
											showOverflowTooltip={false}
											resizable={false}
											columnKey="__table-index"
										/>
									)}
									{state.tableColumns.length === 0
										? slots.default?.()
										: state.tableColumns.map(
												(col) =>
													col.show &&
													col.prop && (
														<FaTableColumn
															vSlots={pick(slots, tableColumnSlotNames.value)}
															{...omit(col, tableColumnOmitNames)}
															hideImage={props.hideImage}
															resizable={true}
															onImagePreview={handleImagePreview}
															onCustomCellClick={handleCustomCellClick}
														/>
													)
											)}
									{slots.operation && (
										<ElTableColumn
											fixed="right"
											width={state.operationColumnWidth}
											headerAlign="center"
											align="left"
											showOverflowTooltip={false}
											className="fa-table__operation-column"
											resizable={false}
											columnKey="__table-operation"
										>
											{{
												header: () => (
													<div class="fa-table__auto-width-column__cell-header __fa-table__auto-width-column__cell-header____table-operation">
														<span>操作</span>
													</div>
												),
												default: ({ row, column, $index }: { row: DefaultRow; column: FaTableColumnCtx; $index: number }) => (
													<div class="fa-table__auto-width-column__cell __fa-table__auto-width-column__cell____table-operation">
														{slots.operation?.({
															row,
															column,
															$index,
															search: tableSearch,
															...getTableDefaultSlots(state),
														})}
													</div>
												),
											}}
										</ElTableColumn>
									)}
								</Fragment>
							),
						}}
					</ElTable>
					<div class="fa-table__main-footer">
						<div class="fa-table__main-footer__left">{slots.footer?.({ search: tableSearch, ...getTableDefaultSlots(state) })}</div>
						{slots.pagination ? (
							slots.pagination({
								pageIndex: state.tablePagination.pageIndex,
								pageSize: state.tablePagination.pageSize,
								totalRows: state.tablePagination.totalRows,
								handleSizeChange,
								handlePaginationChange,
							})
						) : (
							<Fragment>
								{props.pagination ? (
									<FaTablePagination
										pageSizes={props.pageSizes}
										onSizeChange={handleSizeChange}
										onCurrentChange={handlePaginationChange}
									/>
								) : (
									<ElPagination class="fa-table-pagination" size="small" layout="total" total={state.tableData.length} />
								)}
							</Fragment>
						)}
					</div>
				</div>
				{state.imagePreview && (
					<ElImageViewer
						closeOnPressEscape
						hideOnClickModal
						teleported
						showProgress
						onClose={() => (state.imagePreview = false)}
						urlList={state.previewList}
					/>
				)}
				{props.columnSettingBtn && <FaTableColumnsSettingDialog ref={columnSettingRef} change={props.columnsChange} />}
			</div>
		));

		return useExpose(expose, {
			/** 用于多选表格，清空用户的选择 */
			clearSelection: computed(() => tableRef.value?.clearSelection),
			/** 返回当前选中的行 */
			getSelectionRows: computed(() => tableRef.value?.getSelectionRows),
			/** 返回当前半选中的行。 */
			getHalfSelectionRows: computed(() => tableRef.value?.getHalfSelectionRows),
			/** 用于多选表格，切换某一行的选中状态， 如果使用了第二个参数，则可直接设置这一行选中与否 */
			toggleRowSelection: computed(() => tableRef.value?.toggleRowSelection),
			/** 用于多选表格，切换全选和全不选 */
			toggleAllSelection: computed(() => tableRef.value?.toggleAllSelection),
			/** 用于可扩展的表格或树表格，如果某行被扩展，则切换。 使用第二个参数，您可以直接设置该行应该被扩展或折叠。 */
			toggleRowExpansion: computed(() => tableRef.value?.toggleRowExpansion),
			/** 用于单选表格，设定某一行为选中行， 如果调用时不加参数，则会取消目前高亮行的选中状态。 */
			setCurrentRow: computed(() => tableRef.value?.setCurrentRow),
			/** 用于清空排序条件，数据会恢复成未排序的状态 */
			clearSort: computed(() => tableRef.value?.clearSort),
			/** 传入由columnKey 组成的数组以清除指定列的过滤条件。 如果没有参数，清除所有过滤器 */
			clearFilter: computed(() => tableRef.value?.clearFilter),
			/** 对 Table 进行重新布局。 当表格可见性变化时，您可能需要调用此方法以获得正确的布局 */
			doLayout: computed(() => tableRef.value?.doLayout),
			/** 手动排序表格。 参数 prop 属性指定排序列，order 指定排序顺序。 */
			sort: computed(() => tableRef.value?.sort),
			/** 滚动到一组特定坐标 */
			scrollTo: computed(() => tableRef.value?.scrollTo),
			/** 设置垂直滚动位置 */
			setScrollTop: computed(() => tableRef.value?.setScrollTop),
			/** 设置水平滚动位置 */
			setScrollLeft: computed(() => tableRef.value?.setScrollLeft),
			/** 获取表列的 context */
			columns: computed(() => tableRef.value?.columns),
			/** 适用于 lazy Table, 需要设置 rowKey, 更新 key children */
			updateKeyChildren: computed(() => tableRef.value?.updateKeyChildren),
			/** 聚合加载状态；手动关闭不能结束内部任务。 */
			loading: computed({ get: () => state.loading, set: setManualLoading }),
			/** 表格数据 */
			tableData: computed(() => state.tableData),
			/** 分页数据 */
			tablePagination: computed(() => state.tablePagination),
			/** 搜索参数 */
			searchParam: computed(() => state.searchParam),
			/** 选中状态 */
			selected: computed(() => state.selected),
			/** 选中数据列表 */
			selectedList: computed(() => state.selectedList),
			/** 选中数据 rowKey 列表 */
			selectedListIds: computed(() => state.selectedListIds),
			/** 部分选中数据 rowKey 列表 */
			indeterminateSelectedListIds: computed(() => state.indeterminateSelectedListIds),
			/** 表格宽度 */
			tableWidth: computed(() => state.tableWidth),
			/** 表格高度 */
			tableHeight: computed(() => state.tableHeight),
			/** 部分选中（样式不一样而已），用于多选表格，切换某一行的选中状态， 如果使用了第二个参数，则可直接设置这一行选中与否 */
			toggleRowIndeterminateSelection,
			/** 异步方法，刷新表格 */
			refresh: tableSearch,
			/** 异步方法，重置表格 */
			reset: tableReset,
			/** 对 Table 进行重新渲染。当 TableKey 发生变化的时候可以通过此方法重新渲染表格 */
			doRender,
			/** Table 加载 */
			doLoading,
		});
	},
});
