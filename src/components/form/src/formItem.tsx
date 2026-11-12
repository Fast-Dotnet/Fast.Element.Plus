import { Fragment, computed, defineComponent, inject, ref, shallowRef } from "vue";
import { ElFormItem, formItemProps } from "element-plus";
import { makeSlots, useExpose, useProps, useRender } from "../../../utils";
import { FaFormItemTip } from "../../formItemTip";
import { FaLayoutGridItem } from "../../layoutGrid";
import type { FormItemInstance } from "element-plus";
import type { Ref } from "vue";

/** FaFormItem 的运行时 Props 定义 */
export const faFormItemProps = {
	// eslint-disable-next-line @typescript-eslint/no-deprecated -- Element Plus 2.x 尚未提供可替代的公开运行时 props 定义。
	...formItemProps,
	/** Label tips 提示 */
	tips: String,
	/** Grid 布局 */
	grid: {
		type: Boolean,
		default: true,
	},
	/** 偏移量 */
	offset: {
		type: [String, Number],
		default: 0,
	},
	/** 栅格跨度 */
	span: {
		type: [String, Number],
	},
	/** 独占一行。如果设置 span 则无效 */
	row: Boolean,
	/** 展示值，为 `null` 或 `undefined` 时使用默认插槽 */
	value: [String, Number],
};

/** FaFormItem 的插槽参数 */
export interface FaFormItemSlots extends Record<string, unknown> {
	/** 默认内容插槽 */
	default: never;
	/** 标签位置显示的内容 */
	label: { label: string };
	/** 验证错误信息的显示内容 */
	error: { error: string };
}

export default defineComponent({
	name: "FaFormItem",
	props: faFormItemProps,
	slots: makeSlots<FaFormItemSlots>(),
	setup(props, { slots, expose }) {
		const formItemRef = shallowRef<FormItemInstance | null>(null);

		const cols = inject<Ref<number>>("cols", ref(4));

		// 获取响应式设置
		const getResponsive = () => {
			if (!props.grid) return {};
			if (props.span) {
				return {
					span: typeof props.span === "number" ? props.span : Number(props.span),
					offset: typeof props.offset === "number" ? props.offset : Number(props.offset),
				};
			} else {
				const result = {
					span: 1,
					offset: typeof props.offset === "number" ? props.offset : Number(props.offset),
				};
				if (props.row) {
					result.span = cols.value;
				}
				return result;
			}
		};

		// eslint-disable-next-line @typescript-eslint/no-deprecated -- 透传范围必须与继承的 Element Plus 2.x 运行时 props 保持一致。
		const elFormItemProps = useProps(props, formItemProps);

		useRender(() => {
			const FormItemWrapper = props.grid ? FaLayoutGridItem : Fragment;
			return (
				<FormItemWrapper {...getResponsive()}>
					<ElFormItem ref={formItemRef} {...elFormItemProps.value}>
						{{
							default: () => props.value ?? slots.default?.() ?? [],
							...(slots.label && !props.tips && { label: ({ label }: { label: string }) => slots.label?.({ label }) ?? [] }),
							...(slots.label &&
								props.tips && {
									label: ({ label }: { label: string }) => [
										<FaFormItemTip tips={props.tips}>
											{{
												label: () => slots.label?.({ label }) ?? [],
											}}
										</FaFormItemTip>,
									],
								}),
							...(!slots.label &&
								props.tips && {
									label: ({ label }: { label?: string }) => [<FaFormItemTip label={label ?? props.label} tips={props.tips} />],
								}),
							...(slots.error && { error: ({ error }: { error: string }) => slots.error?.({ error }) ?? [] }),
						}}
					</ElFormItem>
				</FormItemWrapper>
			);
		});

		return useExpose(expose, {
			/** 表单项大小 */
			size: computed(() => formItemRef.value?.size),
			/** 校验消息 */
			validateMessage: computed(() => formItemRef.value?.validateMessage),
			/** 校验状态 */
			validateState: computed(() => formItemRef.value?.validateState),
			/** 验证表单项 */
			validate: computed(() => formItemRef.value?.validate),
			/** 移除该表单项的校验结果 */
			clearValidate: computed(() => formItemRef.value?.clearValidate),
			/** 对该表单项进行重置，将其值重置为初始值并移除校验结果 */
			resetField: computed(() => formItemRef.value?.resetField),
			/** 设置该表单项的初始值。 */
			setInitialValue: computed(() => formItemRef.value?.setInitialValue),
		});
	},
});
