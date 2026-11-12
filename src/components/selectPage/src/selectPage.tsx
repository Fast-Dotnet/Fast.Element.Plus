import { Fragment, computed, defineComponent, onBeforeUnmount, reactive, shallowRef, toRef, useModel, watch } from "vue";
import { Search } from "@element-plus/icons-vue";
import { ElButton, ElInput, ElOption, ElPagination, ElSelect, selectEmits, selectProps, useGlobalSize } from "element-plus";
import { addCssUnit, definePropType, isEqual, makeSlots, useEmits, useExpose, useProps, useRender, withDefineType } from "../../../utils";
import { FaSelectOption } from "../../select";
import type { SelectInstance } from "element-plus";
import type { ComponentObjectPropsOptions } from "vue";
import type { ElSelectorModelValue, ElSelectorOutput, ElSelectorValue } from "../../select";
import type { SelectComponentProps } from "../../select/src/select";
import type { PagedInput, PagedResult } from "../../table";

/** FaSelectPage 的运行时 Props 定义 */
export const faSelectPageProps = {
	...selectProps,
	/** 是否禁用选择器；未指定时继承 ElForm 的禁用状态。 */
	disabled: {
		type: Boolean,
		default: undefined,
	},
	/** 远程数据加载时显示的文本；默认显示“加载中...”。 */
	loadingText: {
		type: String,
		default: "加载中...",
	},
	/** 筛选结果为空时显示的文本，也可通过 empty 插槽替换。 */
	noMatchText: {
		type: String,
		default: "暂无匹配的数据",
	},
	/** 没有可选数据时显示的文本，也可通过 empty 插槽替换。 */
	noDataText: {
		type: String,
		default: "暂无数据",
	},
	/** 多选时是否折叠已选标签 */
	collapseTags: {
		type: Boolean,
		default: true,
	},
	/** 悬停折叠标签时是否显示全部选项；仅在 collapse-tags 开启时有效。 */
	collapseTagsTooltip: {
		type: Boolean,
		default: true,
	},
	/** v-model 绑定值 */
	modelValue: {
		type: definePropType<ElSelectorModelValue>([String, Number, Boolean, Object, Array]),
		default: undefined,
	},
	/** v-model:label 绑定值 */
	label: definePropType<string | string[] | null>([String, Array]),
	/** 宽度 */
	width: {
		type: [String, Number],
		default: "100%",
	},
	/** 插槽使用的附加状态 */
	moreDetail: Boolean,
	/** 配置选项 */
	props: {
		type: definePropType<SelectComponentProps>(Object),
		default: () => ({
			label: "label",
			hide: "hide",
			disabled: "disabled",
			children: "children",
		}),
	},
	/** 请求数据的函数 */
	requestApi: {
		type: definePropType<(params?: PagedInput) => Promise<PagedResult<ElSelectorOutput>>>(Function),
		required: true,
	},
	/** 初始化参数 */
	initParam: definePropType<string | number | PagedInput | null>([String, Number, Object]),
} satisfies ComponentObjectPropsOptions;

/** FaSelectPage 的运行时 Emits 定义 */
export const faSelectPageEmits = {
	...selectEmits,
	/** v-model 回调 */
	"update:modelValue": (value: ElSelectorModelValue) =>
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean" ||
		(typeof value === "object" && value !== null) ||
		value == null,
	/** 选中数据改变 */
	change: (_data: ElSelectorOutput | ElSelectorOutput[] | null, _value?: ElSelectorModelValue) => true,
	/** v-model:label 回调 */
	"update:label": (value: string | string[] | null) => typeof value === "string" || Array.isArray(value) || value === null,
	/** 数据改变 */
	dataChange: (data: ElSelectorOutput[]) => Array.isArray(data),
};

/** FaSelectPage 的插槽参数 */
export interface FaSelectPageSlots extends Record<string, unknown> {
	/** FaSelectOption 默认内容插槽 */
	default: ElSelectorOutput;
	/** 下拉列表顶部的内容 */
	header: never;
	/** 下拉列表底部的内容 */
	footer: never;
	/** Select 组件头部内容 */
	prefix: never;
	/** 无选项时的列表 */
	empty: never;
	/** select 组件自定义标签内容 */
	tag: { data: SelectInstance["states"]["selected"]; deleteTag: SelectInstance["deleteTag"]; selectDisabled: boolean };
	/** Select 组件自定义加载内容 */
	loading: never;
	/** select 组件自定义标签内容 */
	label: { label: string; value: string | number | boolean | object; index?: number };
}

export default defineComponent({
	name: "FaSelectPage",
	props: faSelectPageProps,
	emits: faSelectPageEmits,
	slots: makeSlots<FaSelectPageSlots>(),
	setup(props, { slots, emit, expose }) {
		const selectedLabel = useModel(props, "label");

		const globalSize = useGlobalSize();
		const selectRef = shallowRef<InstanceType<typeof ElSelect> | null>(null);

		const state = reactive({
			value: withDefineType<ElSelectorModelValue>(),
			loading: false,
			selectorData: withDefineType<ElSelectorOutput[]>([]),
			/** 选中的数据 */
			selectedList: withDefineType<ElSelectorOutput[]>([]),
			/** 首次出现 */
			debut: true,
			/** 回显 */
			echo: true,
			/** 下次刷新 */
			nextRefresh: false,
			pageIndex: 1,
			pageSize: 15,
			totalRows: 0,
			searchValue: undefined,
			defaultSelectorData: withDefineType<ElSelectorOutput | undefined>(),
		});

		// 新请求、参数变化和卸载都会使旧响应失效。
		let requestVersion = 0;
		let disposed = false;
		const handleData = (data: ElSelectorOutput[]): ElSelectorOutput[] => {
			return data
				.map((item) => {
					const value: unknown = item[props.valueKey];
					const label: unknown = typeof props.props.label === "function" ? props.props.label(item) : item[props.props.label ?? "label"];
					const hide: unknown = typeof props.props.hide === "function" ? props.props.hide(item) : item[props.props.hide ?? "hide"];
					const disabled: unknown =
						typeof props.props.disabled === "function" ? props.props.disabled(item) : item[props.props.disabled ?? "disabled"];
					const children: unknown = item[props.props.children ?? "children"];
					const selectorValue: ElSelectorValue | undefined =
						value !== null &&
						(typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "object")
							? value
							: undefined;
					return {
						...item,
						children: Array.isArray(children) ? handleData(children as ElSelectorOutput[]) : [],
						disabled: typeof disabled === "boolean" ? disabled : undefined,
						hide: typeof hide === "boolean" ? hide : undefined,
						label: typeof label === "string" ? label : undefined,
						value: selectorValue,
					};
				})
				.filter((item) => item.hide !== true);
		};

		const flattenOptions = (data: ElSelectorOutput[]): ElSelectorOutput[] =>
			data.flatMap((item) => [item, ...flattenOptions(item.children ?? [])]);

		const loadData = async (pageIndex?: number) => {
			if (disposed) return;
			const currentRequestVersion = ++requestVersion;
			state.loading = true;
			state.pageIndex = pageIndex ?? state.pageIndex;
			const params: PagedInput = {
				...(typeof props.initParam === "object" && props.initParam !== null ? props.initParam : {}),
				pageIndex: state.pageIndex,
				pageSize: state.pageSize,
				searchValue: state.searchValue,
			};
			try {
				const resData = await props.requestApi(params);
				if (disposed || currentRequestVersion !== requestVersion) return;
				// 这里不允许回显了
				state.echo = false;
				state.totalRows = resData.totalRows ?? 0;
				state.selectorData = handleData(resData.rows ?? []);
				// 最新选项替换回显缓存，保留当前页之外的选中项。
				state.defaultSelectorData &&=
					flattenOptions(state.selectorData).find((item) => isEqual(item.value, state.defaultSelectorData?.value)) ??
					state.defaultSelectorData;
				emit("dataChange", state.selectorData);
			} catch (error) {
				if (disposed || currentRequestVersion !== requestVersion) return;
				state.pageIndex = 1;
				state.totalRows = 0;
				state.selectorData = [];
				throw error;
			} finally {
				if (!disposed && currentRequestVersion === requestVersion) state.loading = false;
			}
		};

		const pageIndexModel = computed({
			get: () => state.pageIndex,
			set: (pageIndex: number) => {
				loadData(pageIndex);
			},
		});

		const handleModelValueUpdate = (value: ElSelectorModelValue) => {
			state.value = value;
			emit("update:modelValue", value);
		};

		const handleVisibleChange = async (visible: boolean) => {
			if (visible) {
				if (state.debut) {
					// 首次出现
					state.debut = false;
					await loadData();
				} else {
					// 判断再次出现是否需要刷新数据
					if (state.nextRefresh) {
						state.nextRefresh = false;
						await loadData();
					}
				}
			}
			// eslint-disable-next-line vue/custom-event-name-casing -- Element Plus 的公开事件名为 visible-change，需要保持原始名称透传。
			emit("visible-change", visible);
		};

		const handleChange = (value?: ElSelectorModelValue) => {
			const selectorData = flattenOptions([
				...state.selectorData,
				...state.selectedList,
				...(state.defaultSelectorData ? [state.defaultSelectorData] : []),
			]);
			if (props.multiple) {
				const valueList = Array.isArray(value) ? value : [];
				if (valueList.length === 0) {
					emit("change", null, null);
					return;
				}
				const dataList = valueList
					.map((item) => selectorData.find((option) => option.value !== undefined && isEqual(option.value, item)))
					.filter((item) => item !== undefined);
				emit("change", dataList, value);
				return;
			}

			if (value == null || Array.isArray(value)) {
				emit("change", null, null);
				return;
			}
			const data = selectorData.find((item) => item.value !== undefined && isEqual(item.value, value));
			emit("change", data ?? null, value);
		};

		watch(
			() => props.modelValue,
			(newValue) => {
				if (state.echo && newValue != null) {
					const hasLabel = props.label != null;
					// 判断是否为多选
					if (props.multiple) {
						if (!Array.isArray(newValue)) {
							console.error("[Fast:FaSelectPage]", "当启用 multiple 时，传入的 modelValue 必须是 Array。");
							return;
						}
						if (hasLabel && !Array.isArray(props.label)) {
							console.error("[Fast:FaSelectPage]", "当启用 multiple 时，传入的 modelValue:label 必须是 Array。");
							return;
						}
						state.selectedList = newValue
							// 最大选项截取
							.slice(0, props.multipleLimit > 0 ? props.multipleLimit : newValue.length)
							.map((item, index) => {
								const value: unknown = item;
								const label: unknown = Array.isArray(props.label) ? props.label[index] : undefined;
								const selectorValue: ElSelectorValue | undefined =
									value !== null &&
									(typeof value === "string" ||
										typeof value === "number" ||
										typeof value === "boolean" ||
										typeof value === "object")
										? value
										: undefined;
								return {
									value: selectorValue,
									label: hasLabel && typeof label === "string" ? label : undefined,
								};
							});
					} else {
						if (Array.isArray(newValue)) {
							console.error("[Fast:FaSelectPage]", "当禁用 multiple 时，传入的 modelValue 不能是 Array。");
							return;
						}
						if (hasLabel && Array.isArray(props.label)) {
							console.error("[Fast:FaSelectPage]", "当禁用 multiple 时，传入的 modelValue:label 不能是 Array。");
							return;
						}
						state.defaultSelectorData = {
							value: newValue,
							label: typeof props.label === "string" ? props.label : undefined,
						};
					}
				}
				state.value = newValue;
			},
			{
				immediate: true,
			}
		);

		watch(
			[() => state.value, () => state.selectorData],
			([value]) => {
				const selectorData = flattenOptions([
					...state.selectorData,
					...state.selectedList,
					...(state.defaultSelectorData ? [state.defaultSelectorData] : []),
				]);

				if (props.multiple) {
					if (!Array.isArray(value)) {
						state.selectedList = [];
						selectedLabel.value = null;
						return;
					}

					state.selectedList = value
						.map((item) => selectorData.find((option) => option.value !== undefined && isEqual(option.value, item)))
						.filter((item) => item !== undefined);
					selectedLabel.value = value.map((item, index) => {
						const data = state.selectedList.find((option) => option.value !== undefined && isEqual(option.value, item));

						return data?.label ?? (Array.isArray(props.label) ? (props.label[index] ?? "") : "");
					});
					return;
				}

				if (value == null || Array.isArray(value)) {
					state.selectedList = [];
					state.defaultSelectorData = undefined;
					selectedLabel.value = null;
					return;
				}

				const data = selectorData.find((item) => item.value !== undefined && isEqual(item.value, value));
				state.selectedList = data ? [data] : [];
				selectedLabel.value = data?.label ?? (typeof props.label === "string" ? props.label : null);
			},
			{
				deep: true,
				flush: "sync",
				immediate: true,
			}
		);

		watch(
			() => props.initParam,
			(newValue, oldValue) => {
				if (!isEqual(newValue, oldValue)) {
					requestVersion++;
					state.loading = false;
					state.selectorData = [];
					state.selectedList = [];
					state.defaultSelectorData = undefined;
					state.pageIndex = 1;
					state.nextRefresh = true;
					if (state.value != null) {
						handleModelValueUpdate(props.multiple ? [] : undefined);
					}
				}
			}
		);

		onBeforeUnmount(() => {
			disposed = true;
			requestVersion++;
		});

		const elSelectProps = useProps(props, selectProps, ["modelValue", "popperClass", "loading", "props"]);
		const elSelectEmits = useEmits(selectEmits, emit, ["update:modelValue", "change", "visible-change"]);
		const elPopperClass = computed(() => [
			`fa-select-page-dropdown fa-select-page-dropdown-${globalSize.value}`,
			props.popperClass,
			props.moreDetail && `fa-select-dropdown__more-detail fa-select-dropdown__more-detail-${globalSize.value}`,
		]);

		useRender(() => (
			<ElSelect
				{...elSelectProps.value}
				{...elSelectEmits.value}
				ref={selectRef}
				class="fa-select-page"
				popperClass={elPopperClass.value}
				style={{ width: addCssUnit(props.width) }}
				modelValue={state.value}
				onUpdate:modelValue={handleModelValueUpdate}
				onChange={handleChange}
				loading={state.loading}
				onVisible-change={handleVisibleChange}
			>
				{{
					default: () =>
						state.selectorData.map((item) => (
							<FaSelectOption vSlots={{ default: slots.default }} data={item} moreDetail={props.moreDetail} />
						)),
					header: () => [
						<Fragment>
							{state.defaultSelectorData?.value !== undefined && (
								<ElOption
									class="fa-select-page-dropdown__default-selector"
									value={state.defaultSelectorData.value}
									label={state.defaultSelectorData.label ?? ""}
									disabled={true}
								>
									<span>{state.defaultSelectorData.label}</span>
									<span>Default</span>
								</ElOption>
							)}
							{
								<ElInput
									class="fa-select-page-dropdown__search-input"
									clearable={Boolean(state.searchValue)}
									placeholder="请输入关键字搜索"
									vModel_trim={state.searchValue}
									onKeyup={(event: KeyboardEvent) => event.key === "Enter" && loadData(1)}
								>
									{{
										append: () => <ElButton loading={state.loading} icon={Search} onClick={() => loadData(1)} />,
									}}
								</ElInput>
							}

							{slots.header?.()}
						</Fragment>,
					],
					footer: () => (
						<Fragment>
							<ElPagination
								class="fa-select-page-dropdown__pagination"
								size="small"
								vModel:currentPage={pageIndexModel.value}
								pageSize={state.pageSize}
								total={state.totalRows}
								layout="prev, pager, next, total"
								pagerCount={5}
							/>
							{slots.footer?.()}
						</Fragment>
					),
					...(slots.prefix && { prefix: () => slots.prefix?.() ?? [] }),
					...(slots.empty && { empty: () => slots.empty?.() ?? [] }),
					...(slots.tag && { tag: slots.tag }),
					...(slots.loading && { loading: () => slots.loading?.() ?? [] }),
					...(props.multiple
						? {
								label: ({ label, value, index }: FaSelectPageSlots["label"]) => {
									const selectedData = state.selectedList.find((f) => f.value === value);
									if (slots.label) {
										return slots.label({ label: selectedData?.label ?? label, value: selectedData?.value ?? value, index });
									}
									return selectedData ? [<span class="el-select__tags-text">{selectedData.label}</span>] : [];
								},
							}
						: slots.label && { label: slots.label }),
				}}
			</ElSelect>
		));

		return useExpose(expose, {
			/** 使选择器的输入框获取焦点 */
			focus: computed(() => selectRef.value?.focus),
			/** 使选择器的输入框失去焦点，并隐藏下拉框 */
			blur: computed(() => selectRef.value?.blur),
			/** 获取当前选中的标签 */
			selectedLabel: computed(() => selectRef.value?.selectedLabel),
			/** 加载状态 */
			loading: toRef(state, "loading"),
			/** 选中的数据 */
			selectedList: computed(() => state.selectedList),
			/** 刷新 */
			refresh: loadData,
			/** 设置选择 */
			setSelection: (value: Exclude<ElSelectorModelValue, null | undefined>) => handleModelValueUpdate(value),
			/** 清除选择 */
			clearSelection: () => handleModelValueUpdate(props.multiple ? [] : undefined),
		});
	},
});
