import { Fragment, computed, defineComponent, h, reactive, resolveComponent } from "vue";
import { ElOption, ElOptionGroup } from "element-plus";
import { definePropType, makeSlots, useRender } from "../../../utils";
import type { ElSelectorOutput, ElSelectorValue } from "./select.type";

export default defineComponent({
	name: "FaSelectOption",
	props: {
		/** 绑定值，优先级比 data 高 */
		value: {
			type: definePropType<string | number | boolean | object>([String, Number, Boolean, Object]),
			default: undefined,
		},
		/** 显示值，优先级比 data 高 */
		label: String,
		/** 是否为创建的选项 */
		created: Boolean,
		/** 禁用值，优先级比 data 高 */
		disabled: {
			type: Boolean,
			default: undefined,
		},
		/** 子节点，优先级比 data 高 */
		children: {
			type: definePropType<ElSelectorOutput[]>(Array),
		},
		/** 下拉框数据 */
		data: {
			type: definePropType<ElSelectorOutput>(Object),
			default: () => ({}),
		},
		/** 插槽使用的附加状态 */
		moreDetail: Boolean,
	},
	slots: makeSlots<{
		/** 默认内容插槽 */
		default: ElSelectorOutput;
	}>(),
	setup(props, { slots }) {
		const state = reactive({
			value: computed<ElSelectorValue>(() => props.value ?? props.data.value ?? ""),
			label: computed(() => props.label ?? props.data.label),
			disabled: computed(() => props.disabled ?? props.data.disabled ?? false),
			children: computed(() => props.children ?? props.data.children ?? []),
		});

		useRender(() => (
			<Fragment>
				{state.children.length > 0 ? (
					<ElOptionGroup label={state.label} disabled={state.disabled}>
						{state.children.map((item) =>
							h(
								resolveComponent("FaSelectOption"),
								{
									moreDetail: props.moreDetail,
									data: item,
								},
								slots
							)
						)}
					</ElOptionGroup>
				) : (
					<ElOption
						class={{ "fa-select-dropdown__selector__more-detail": props.moreDetail && slots.default }}
						value={state.value}
						label={state.label}
						created={props.created}
						disabled={state.disabled}
					>
						{slots.default?.(props.data)}
					</ElOption>
				)}
			</Fragment>
		));
	},
});
