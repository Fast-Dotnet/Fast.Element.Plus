import { computed, defineComponent, onMounted, reactive, shallowRef, toRef, useModel, watch } from "vue";
import { ElTreeSelect, selectEmits, selectProps, treeEmits, treeProps } from "element-plus";
import { addCssUnit, definePropType, isEqual, makeSlots, useEmits, useExpose, useProps, useRender, withDefineType } from "../../../utils";
import type { FilterValue, SelectInstance, TreeInstance, TreeNodeData } from "element-plus";
import type { ComponentInternalInstance } from "vue";
import type { ElSelectorModelValue, ElSelectorOutput, ElSelectorValue } from "../../select";
import type { SelectComponentProps } from "../../select/src/select";
import type { PagedInput } from "../../table";
import type { FilterNodeMethodFunction, TreeNode } from "../../tree/src/tree.props";

/** 补充 Element Plus TreeSelect 运行时支持但类型声明缺失的事件。 */
type ElTreeSelectRuntimeType = typeof ElTreeSelect &
	(new () => {
		$props: InstanceType<typeof ElTreeSelect>["$props"] & {
			onNodeClick?: (data: ElSelectorOutput, node: TreeNode, instance: ComponentInternalInstance | null) => void;
			onChange?: (value: ElSelectorModelValue) => void;
			"onUpdate:modelValue"?: (value: ElSelectorModelValue) => void;
		};
	});

const ElTreeSelectRuntime = ElTreeSelect as ElTreeSelectRuntimeType;

/** Element Plus TreeSelect 运行时实际暴露的方法集合。 */
type ElTreeSelectExposes = Pick<SelectInstance, "focus" | "blur" | "selectedLabel"> &
	Pick<
		TreeInstance,
		| "filter"
		| "updateKeyChildren"
		| "getCheckedNodes"
		| "setCheckedNodes"
		| "getCheckedKeys"
		| "setCheckedKeys"
		| "setChecked"
		| "getHalfCheckedNodes"
		| "getHalfCheckedKeys"
		| "getCurrentKey"
		| "getCurrentNode"
		| "setCurrentKey"
		| "setCurrentNode"
		| "getNode"
		| "remove"
		| "append"
		| "insertBefore"
		| "insertAfter"
	> & {
		treeRef: TreeInstance;
		selectRef: SelectInstance;
	};

/** FaTreeSelect 的运行时 Props 定义 */
export const faTreeSelectProps = {
	...selectProps,
	...treeProps,
	/** 树节点筛选方法。 */
	filterNodeMethod: {
		type: definePropType<FilterNodeMethodFunction>(Function),
	},
	/**
	 * 懒加载节点的缓存数据，结构与数据相同，用于获取未加载数据的标签
	 * The cached data of the lazy node, the structure is the same as the data, used to get the label of the unloaded data
	 */
	cacheData: {
		type: definePropType<
			| {
					value: string | number | boolean | object;
					currentLabel: string | number;
					isDisabled: boolean;
			  }[]
			| ElSelectorOutput[]
		>(Array),
		default: () => [],
	},
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
	/** 每个树节点用来作为唯一标识的属性，整棵树应该是唯一的 */
	nodeKey: {
		type: String,
		default: "value",
	},
	/** 是否默认展开所有节点 */
	defaultExpandAll: {
		type: Boolean,
		default: true,
	},
	/** 是否在点击节点的时候选中节点 */
	checkOnClickNode: {
		type: Boolean,
		default: true,
	},
	/** 是否高亮当前选中节点 */
	highlightCurrent: {
		type: Boolean,
		default: true,
	},
	/** 是否在点击节点的时候展开或者收缩节点， 默认值为 true，如果为 false，则只有点箭头图标的时候才会展开或者收缩节点。 */
	expandOnClickNode: Boolean,
	/** 点击折叠节点，需要开启 'expandOnClickNode' */
	collapseOnClickNode: Boolean,
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
	/** 下拉框数据 */
	data: {
		type: definePropType<ElSelectorOutput[]>(Array),
		default: () => [],
	},
	/** 请求数据的函数 */
	requestApi: {
		type: definePropType<(params?: string | number | PagedInput) => Promise<ElSelectorOutput[]>>(Function),
	},
	/** 初始化参数 */
	initParam: definePropType<string | number | PagedInput | null>([String, Number, Object]),
};

/** FaTreeSelect 的运行时 Emits 定义 */
export const faTreeSelectEmits = {
	...selectEmits,
	...treeEmits,
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
	/** 节点点击 */
	"node-click": (_data: ElSelectorOutput, _node: TreeNode, _instance: ComponentInternalInstance | null) => true,
};

/** FaTreeSelect 的插槽参数 */
export interface FaTreeSelectSlots extends Record<string, unknown> {
	/** 默认内容插槽 */
	default: { node: TreeNode; data: ElSelectorOutput; store: TreeInstance["store"] };

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
	name: "FaTreeSelect",
	props: faTreeSelectProps,
	emits: faTreeSelectEmits,
	slots: makeSlots<FaTreeSelectSlots>(),
	setup(props, { slots, emit, expose }) {
		const selectedLabel = useModel(props, "label");

		const treeSelectRef = shallowRef<ElTreeSelectExposes | null>(null);

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

		const handleData = (data: ElSelectorOutput[]): ElSelectorOutput[] => {
			return data
				.map((item) => {
					const value: unknown = item[props.nodeKey];
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

		const handleModelValueUpdate = (value: ElSelectorModelValue) => {
			state.value = value;
			emit("update:modelValue", value);
		};

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
					state.selectorData = handleData(resData);
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
				state.selectorData = handleData(props.data);
			}
		};

		const handleFilterNode = (value: FilterValue, data: TreeNodeData, child: TreeNode) => {
			if (!value) return true;
			let parentNode = child.parent,
				labels = [child.label],
				level = 1;
			while (level < child.level && parentNode) {
				labels = [...labels, parentNode.label];
				parentNode = parentNode.parent;
				level++;
			}
			const filterText = typeof value === "string" || typeof value === "number" ? String(value) : "";
			const result = labels.some((label) => label.includes(filterText));
			if (props.filterNodeMethod) {
				return result && props.filterNodeMethod(value, data, child);
			}
			return result;
		};

		const handleNodeClick = (data: ElSelectorOutput, node: TreeNode, instance: ComponentInternalInstance | null) => {
			// 判断是否开启点击展开节点，并且节点是折叠状态，则自动展开，否则需要点击箭头图标才能折叠或开启 'collapseOnClickNode'
			if (props.expandOnClickNode) {
				if (!node.expanded) {
					node.expand();
				} else if (props.collapseOnClickNode) {
					node.collapse();
				}
			}
			// eslint-disable-next-line vue/custom-event-name-casing -- Element Plus 的公开事件名为 node-click，需要保持原始名称透传。
			emit("node-click", data, node, instance);
		};

		/**
		 * 下拉框出现/隐藏时触发
		 */
		const handleVisibleChange = async (visible: boolean) => {
			if (visible) {
				if (state.debut) {
					// 首次出现
					state.debut = false;
					// 懒加载
					props.lazy && (await loadData());
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

		const flattenOptions = (data: ElSelectorOutput[]): ElSelectorOutput[] =>
			data.flatMap((item) => [item, ...flattenOptions(item.children ?? [])]);

		const nodeLazy = computed(() => !props.requestApi && typeof props.load === "function");

		const handleChange = (value?: ElSelectorModelValue) => {
			const selectorData = flattenOptions(state.selectorData);
			const findOption = (key: ElSelectorValue) => {
				const option = selectorData.find((item) => item.value !== undefined && isEqual(item.value, key));
				if (option || !nodeLazy.value || (typeof key !== "number" && typeof key !== "string")) return option;
				const node = treeSelectRef.value?.getNode(key);
				return node ? handleData([node.data])[0] : undefined;
			};
			if (props.multiple) {
				const valueList = Array.isArray(value) ? value : [];
				if (valueList.length === 0) {
					emit("change", null, null);
					return;
				}
				const dataList = valueList.map(findOption).filter((item) => item !== undefined);
				emit("change", dataList, value);
				return;
			}

			if (value == null || Array.isArray(value)) {
				emit("change", null, null);
				return;
			}
			const data = findOption(value);
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
							console.error("[Fast:FaTreeSelect]", "当启用 multiple 时，传入的 modelValue 必须是 Array。");
							return;
						}
						if (hasLabel && !Array.isArray(props.label)) {
							console.error("[Fast:FaTreeSelect]", "当启用 multiple 时，传入的 modelValue:label 必须是 Array。");
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
							console.error("[Fast:FaTreeSelect]", "当禁用 multiple 时，传入的 modelValue 不能是 Array。");
							return;
						}
						if (hasLabel && Array.isArray(props.label)) {
							console.error("[Fast:FaTreeSelect]", "当禁用 multiple 时，传入的 modelValue:label 不能是 Array。");
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
						const data = selectorData.find((option) => option.value !== undefined && isEqual(option.value, item));

						return data?.label ?? (Array.isArray(props.label) ? (props.label[index] ?? "") : "");
					});
					return;
				}

				if (value == null || Array.isArray(value)) {
					selectedLabel.value = null;
					return;
				}

				selectedLabel.value =
					selectorData.find((item) => item.value !== undefined && isEqual(item.value, value))?.label ??
					(typeof props.label === "string" ? props.label : null);
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
				if (firstItem?.value !== undefined) {
					if (props.multiple) {
						handleModelValueUpdate([firstItem.value]);
					} else {
						handleModelValueUpdate(firstItem.value);
					}
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

		const elTreeSelectProps = useProps(props, { ...selectProps, ...treeProps }, [
			"modelValue",
			"popperClass",
			"lazy",
			"loading",
			"expandOnClickNode",
			"filterNodeMethod",
			"props",
		]);
		const elTreeSelectEmits = useEmits({ ...selectEmits, ...treeEmits }, emit, ["update:modelValue", "change", "visible-change", "node-click"]);

		useRender(() => (
			<ElTreeSelectRuntime
				{...elTreeSelectProps.value}
				{...elTreeSelectEmits.value}
				ref={treeSelectRef}
				class="fa-tree-select"
				popperClass={["fa-tree-select-dropdown", props.popperClass]}
				style={{ width: addCssUnit(props.width) }}
				modelValue={state.value}
				onUpdate:modelValue={handleModelValueUpdate}
				onChange={handleChange}
				lazy={nodeLazy.value}
				loading={state.loading}
				data={state.selectorData}
				cacheData={props.cacheData}
				expandOnClickNode={props.checkOnClickNode ? false : props.expandOnClickNode}
				filterNodeMethod={handleFilterNode as typeof props.filterNodeMethod}
				onNodeClick={handleNodeClick}
				onVisible-change={handleVisibleChange}
			>
				{{
					...(slots.default && { default: slots.default }),
					...(slots.header && { header: () => slots.header?.() ?? [] }),
					...(slots.footer && { footer: () => slots.footer?.() ?? [] }),
					...(slots.prefix && { prefix: () => slots.prefix?.() ?? [] }),
					...(slots.empty && { empty: () => slots.empty?.() ?? [] }),
					...(slots.tag && { tag: slots.tag }),
					...(slots.loading && { loading: () => slots.loading?.() ?? [] }),
					...(slots.label && { label: slots.label }),
				}}
			</ElTreeSelectRuntime>
		));

		return useExpose(expose, {
			/** 使选择器的输入框获取焦点。 */
			focus: computed(() => treeSelectRef.value?.focus),
			/** 使选择器的输入框失去焦点，并隐藏下拉框。 */
			blur: computed(() => treeSelectRef.value?.blur),
			/** 获取当前选中的标签。 */
			selectedLabel: computed(() => treeSelectRef.value?.selectedLabel),
			/** 过滤所有树节点，过滤后的节点将被隐藏。 */
			filter: computed(() => treeSelectRef.value?.filter),
			/** 为节点设置新数据，只有设置 node-key 时可用。 */
			updateKeyChildren: computed(() => treeSelectRef.value?.updateKeyChildren),
			/** 获取当前选中的节点。 */
			getCheckedNodes: computed(() => treeSelectRef.value?.getCheckedNodes),
			/** 设置当前选中的节点。 */
			setCheckedNodes: computed(() => treeSelectRef.value?.setCheckedNodes),
			/** 获取当前选中的节点 Key。 */
			getCheckedKeys: computed(() => treeSelectRef.value?.getCheckedKeys),
			/** 设置当前选中的节点 Key。 */
			setCheckedKeys: computed(() => treeSelectRef.value?.setCheckedKeys),
			/** 设置节点选中状态。 */
			setChecked: computed(() => treeSelectRef.value?.setChecked),
			/** 获取当前半选中的节点。 */
			getHalfCheckedNodes: computed(() => treeSelectRef.value?.getHalfCheckedNodes),
			/** 获取当前半选中的节点 Key。 */
			getHalfCheckedKeys: computed(() => treeSelectRef.value?.getHalfCheckedKeys),
			/** 获取当前节点 Key。 */
			getCurrentKey: computed(() => treeSelectRef.value?.getCurrentKey),
			/** 获取当前节点。 */
			getCurrentNode: computed(() => treeSelectRef.value?.getCurrentNode),
			/** 设置当前节点 Key。 */
			setCurrentKey: computed(() => treeSelectRef.value?.setCurrentKey),
			/** 设置当前节点。 */
			setCurrentNode: computed(() => treeSelectRef.value?.setCurrentNode),
			/** 根据数据或 Key 获取节点。 */
			getNode: computed(() => treeSelectRef.value?.getNode),
			/** 删除节点。 */
			remove: computed(() => treeSelectRef.value?.remove),
			/** 追加子节点。 */
			append: computed(() => treeSelectRef.value?.append),
			/** 在指定节点前插入节点。 */
			insertBefore: computed(() => treeSelectRef.value?.insertBefore),
			/** 在指定节点后插入节点。 */
			insertAfter: computed(() => treeSelectRef.value?.insertAfter),
			/** Element Plus Tree 实例。 */
			treeRef: computed(() => treeSelectRef.value?.treeRef),
			/** Element Plus Select 实例。 */
			selectRef: computed(() => treeSelectRef.value?.selectRef),
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
