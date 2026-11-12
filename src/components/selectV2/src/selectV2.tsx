import { computed, defineComponent, onMounted, reactive, shallowRef, toRef, useModel, watch } from "vue";
import { ElSelectV2, useGlobalSize } from "element-plus";
import { SelectV2Props } from "../../../internal/props";
import { addCssUnit, definePropType, isEqual, makeSlots, useEmits, useExpose, useProps, useRender, withDefineType } from "../../../utils";
import type { ScrollbarDirection, SelectV2Instance } from "element-plus";
import type { ElSelectorModelValue, ElSelectorOutput, ElSelectorValue } from "../../select/src/select.type";
import type { PagedInput, PagedResult } from "../../table";

export { SelectV2Props } from "../../../internal/props";
export type { Props } from "../../../internal/props";

/** 底层虚拟化选择器的运行时 Emits 定义。 */
export const selectV2Emits = {
	"update:modelValue": (_value: ElSelectorModelValue) => true,
	change: (_value: ElSelectorModelValue) => true,
	"end-reached": (_direction: ScrollbarDirection) => true,
	"remove-tag": (_value: ElSelectorValue) => true,
	"visible-change": (_visible: boolean) => true,
	focus: (_event: FocusEvent) => true,
	blur: (_event: FocusEvent) => true,
	clear: () => true,
};

/** FaSelectV2 的运行时 Props 定义 */
export const faSelectV2Props = {
	...SelectV2Props,
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
	/** 是否延迟加载远程数据；开启后在首次打开下拉框时请求。 */
	lazy: {
		type: Boolean,
		default: true,
	},
	/** 是否默认选中；不能与懒加载同时使用。 */
	defaultSelected: Boolean,
	/** 下拉框数据 */
	data: {
		type: definePropType<ElSelectorOutput[]>(Array),
		default: () => [],
	},
	/** 分页返回 */
	pageResult: Boolean,
	/** 请求数据的函数 */
	requestApi: {
		type: definePropType<(params?: string | number | PagedInput) => Promise<ElSelectorOutput[] | PagedResult<ElSelectorOutput>>>(Function),
	},
	/** 初始化参数 */
	initParam: definePropType<string | number | PagedInput>([String, Number, Object]),
};

/** FaSelectV2 的运行时 Emits 定义 */
export const faSelectV2Emits = {
	...selectV2Emits,
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

/** FaSelectV2 的插槽参数 */
export interface FaSelectV2Slots extends Record<string, unknown> {
	/** FaSelectOption 默认内容插槽 */
	default: { item: ElSelectorOutput; index: number; disabled: boolean };
	/** 下拉列表顶部的内容 */
	header: never;
	/** 下拉列表底部的内容 */
	footer: never;
	/** Select 组件头部内容 */
	prefix: never;
	/** 无选项时的列表 */
	empty: never;
	/** select 组件自定义标签内容 */
	tag: { data: SelectV2Instance["states"]["cachedOptions"]; deleteTag: SelectV2Instance["deleteTag"]; selectDisabled: boolean };
	/** Select 组件自定义加载内容 */
	loading: never;
	/** select 组件自定义标签内容 */
	label: { label: string; value: string | number | boolean | object; index?: number };
}

export default defineComponent({
	name: "FaSelectV2",
	props: faSelectV2Props,
	emits: faSelectV2Emits,
	slots: makeSlots<FaSelectV2Slots>(),
	setup(props, { slots, emit, expose }) {
		const selectedLabel = useModel(props, "label");

		const globalSize = useGlobalSize();
		const selectV2Ref = shallowRef<InstanceType<typeof ElSelectV2> | null>(null);

		const state = reactive({
			value: withDefineType<ElSelectorModelValue>(),
			loading: false,
			selectorData: withDefineType<ElSelectorOutput[]>([]),
			/** 首次出现 */
			debut: true,
			/** 回显 */
			echo: true,
			/** 下次刷新 */
			nextRefresh: false,
		});

		let requestVersion = 0;

		const loadData = async () => {
			const currentRequestVersion = ++requestVersion;
			// 判断是否需要自动请求
			if (props.requestApi) {
				state.loading = true;
				const params = props.initParam ?? {};
				try {
					const resData = await props.requestApi(params);
					if (currentRequestVersion !== requestVersion) return;
					// 这里不允许回显了
					state.echo = false;
					// 判断是否为分页返回
					if (props.pageResult) {
						state.selectorData = (resData as PagedResult<ElSelectorOutput>).rows ?? [];
					} else {
						state.selectorData = resData as ElSelectorOutput[];
					}
					emit("dataChange", state.selectorData);
				} catch (error) {
					if (currentRequestVersion !== requestVersion) return;
					state.selectorData = [];
					throw error;
				} finally {
					if (currentRequestVersion === requestVersion) state.loading = false;
				}
			} else {
				if (currentRequestVersion !== requestVersion) return;
				// 这里不允许回显了
				state.echo = false;
				state.selectorData = props.data;
			}
		};

		const handleModelValueUpdate = (value: ElSelectorModelValue) => {
			state.value = value;
			emit("update:modelValue", value);
		};

		const handleVisibleChange = async (visible: boolean) => {
			if (visible) {
				if (state.debut) {
					// 首次出现
					state.debut = false;
					// 懒加载
					!props.defaultSelected && props.lazy && (await loadData());
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

		const getOptionValue = (item: ElSelectorOutput) => {
			const value: unknown = item[props.props.value ?? "value"];
			return value !== null &&
				(typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "object")
				? value
				: undefined;
		};

		const getOptionLabel = (item: ElSelectorOutput) => {
			const label: unknown = item[props.props.label ?? "label"];
			return typeof label === "string" ? label : undefined;
		};

		const flattenOptions = (data: ElSelectorOutput[]): ElSelectorOutput[] =>
			data.flatMap((item) => {
				const children: unknown = item[props.props.options ?? "options"];
				return [item, ...(Array.isArray(children) ? flattenOptions(children as ElSelectorOutput[]) : [])];
			});

		const handleChange = (value?: ElSelectorModelValue) => {
			const selectorData = flattenOptions(state.selectorData);
			if (props.multiple) {
				const valueList = Array.isArray(value) ? value : [];
				if (valueList.length === 0) {
					emit("change", null, null);
					return;
				}
				const dataList = valueList
					.map((item) =>
						selectorData.find((option) => {
							const optionValue = getOptionValue(option);
							return optionValue !== undefined && isEqual(optionValue, item);
						})
					)
					.filter((item) => item !== undefined);
				emit("change", dataList, value);
				return;
			}

			if (value == null || Array.isArray(value)) {
				emit("change", null, null);
				return;
			}
			const data = selectorData.find((option) => {
				const optionValue = getOptionValue(option);
				return optionValue !== undefined && isEqual(optionValue, value);
			});
			emit("change", data ?? null, value);
		};

		watch(
			() => props.modelValue,
			(newValue) => {
				if (state.echo && newValue != null) {
					const hasLabel = props.label != null;
					// 判断是否为多选
					if (props.multiple) {
						// 判断是否为数组
						if (!Array.isArray(newValue)) {
							console.error("[Fast:FaSelectV2]", "当启用 multiple 时，传入的 modelValue 必须是 Array。");
							return;
						}
						if (hasLabel && !Array.isArray(props.label)) {
							console.error("[Fast:FaSelectV2]", "当启用 multiple 时，传入的 modelValue:label 必须是 Array。");
							return;
						}
						state.selectorData = newValue
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
							console.error("[Fast:FaSelectV2]", "当禁用 multiple 时，传入的 modelValue 不能是 Array。");
							return;
						}
						if (hasLabel && Array.isArray(props.label)) {
							console.error("[Fast:FaSelectV2]", "当禁用 multiple 时，传入的 modelValue:label 不能是 Array。");
							return;
						}
						state.selectorData = [
							{
								value: newValue,
								label: typeof props.label === "string" ? props.label : undefined,
							},
						];
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
				const selectorData = flattenOptions(state.selectorData);
				if (props.multiple) {
					if (!Array.isArray(value)) {
						selectedLabel.value = null;
						return;
					}
					selectedLabel.value = value.map((item, index) => {
						const data = selectorData.find((option) => {
							const optionValue = getOptionValue(option);
							return optionValue !== undefined && isEqual(optionValue, item);
						});
						return (data && getOptionLabel(data)) ?? (Array.isArray(props.label) ? (props.label[index] ?? "") : "");
					});
					return;
				}
				if (value == null || Array.isArray(value)) {
					selectedLabel.value = null;
					return;
				}
				const data = selectorData.find((option) => {
					const optionValue = getOptionValue(option);
					return optionValue !== undefined && isEqual(optionValue, value);
				});
				selectedLabel.value = (data && getOptionLabel(data)) ?? (typeof props.label === "string" ? props.label : null);
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
					state.nextRefresh = true;
					if (state.value != null) {
						handleModelValueUpdate(props.multiple ? [] : undefined);
					}
				}
			}
		);

		watch(
			() => props.data,
			() => {
				if (!props.requestApi) {
					return loadData();
				}
			},
			{ deep: true }
		);

		watch(
			() => props.data.length,
			(length) => {
				if (state.debut) state.echo = length === 0;
			},
			{ immediate: true }
		);

		onMounted(async () => {
			if (props.defaultSelected) {
				await loadData();
				const firstItem = state.selectorData[0];
				const firstValue = firstItem && getOptionValue(firstItem);
				if (firstValue !== undefined) {
					handleModelValueUpdate(props.multiple ? [firstValue] : firstValue);
				}
			}
			// 判断是否为本地数据
			else if (!props.requestApi && props.data.length > 0) {
				state.debut = false;
				await loadData();
			}
			// 判断是否非默认选中,且未启用懒加载
			else if (!props.lazy) {
				await loadData();
			}
		});

		const elSelectV2Props = useProps(props, SelectV2Props, ["modelValue", "popperClass", "loading", "options", "itemHeight"]);
		const elSelectV2Emits = useEmits(selectV2Emits, emit, ["update:modelValue", "change", "visible-change"]);
		const elPopperClass = computed(() => {
			let localClass = `fa-select-v2-dropdown ${props.popperClass}`;
			if (props.moreDetail) {
				localClass += ` fa-select-v2-dropdown__more-detail fa-select-v2-dropdown__more-detail-${globalSize.value}`;
			}
			return localClass;
		});

		useRender(() => (
			<ElSelectV2
				{...elSelectV2Props.value}
				{...elSelectV2Emits.value}
				ref={selectV2Ref}
				class="fa-select-v2"
				popperClass={elPopperClass.value}
				style={{ width: addCssUnit(props.width) }}
				modelValue={state.value}
				onUpdate:modelValue={handleModelValueUpdate}
				onChange={handleChange}
				loading={state.loading}
				options={state.selectorData}
				itemHeight={props.itemHeight + (globalSize.value === "small" ? 0 : 8)}
				onVisible-change={handleVisibleChange}
			>
				{{
					...(slots.default && {
						default: ({ item, index, disabled }: { item: ElSelectorOutput; index: number; disabled: boolean }) =>
							slots.default?.({ item, index, disabled }) ?? [],
					}),
					...(slots.header && { header: () => slots.header?.() ?? [] }),
					...(slots.footer && { footer: () => slots.footer?.() ?? [] }),
					...(slots.prefix && { prefix: () => slots.prefix?.() ?? [] }),
					...(slots.empty && { empty: () => slots.empty?.() ?? [] }),
					...(slots.tag && { tag: slots.tag }),
					...(slots.loading && { loading: () => slots.loading?.() ?? [] }),
					...(slots.label && { label: slots.label }),
				}}
			</ElSelectV2>
		));

		return useExpose(expose, {
			/** 使选择器的输入框获取焦点 */
			focus: computed(() => selectV2Ref.value?.focus),
			/** 使选择器的输入框失去焦点，并隐藏下拉框 */
			blur: computed(() => selectV2Ref.value?.blur),
			/** 获取当前选中的标签 */
			selectedLabel: computed(() => selectV2Ref.value?.selectedLabel),
			/** 滚动到指定选项索引。 */
			scrollTo: computed(() => selectV2Ref.value?.scrollTo),
			/** 加载状态 */
			loading: toRef(state, "loading"),
			/** 刷新 */
			refresh: loadData,
			/** 设置选择 */
			setSelection: (value: Exclude<ElSelectorModelValue, null | undefined>) => handleModelValueUpdate(value),
			/** 清除选择 */
			clearSelection: () => handleModelValueUpdate(props.multiple ? [] : undefined),
		});
	},
});
