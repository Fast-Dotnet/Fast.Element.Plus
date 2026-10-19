import { computed, defineComponent, provide, reactive, shallowRef } from "vue";
import { ElForm, formEmits, formProps, useGlobalSize } from "element-plus";
import { definePropType, makeSlots, useEmits, useExpose, useProps, useRender } from "../../../utils";
import { FaLayoutGrid } from "../../layoutGrid";
import { formUtil } from "../utils/form";
import type { FormInstance, FormValidateCallback } from "element-plus";
import type { FaLayoutGridBreakpoint } from "../../layoutGrid";

/** FaForm 的运行时 Props 定义 */
export const faFormProps = {
	// eslint-disable-next-line @typescript-eslint/no-deprecated -- Element Plus 2.x 尚未提供可替代的公开运行时 props 定义。
	...formProps,
	/** Width of label, e.g. `'50px'`. All its direct child form items will inherit this value. `auto` is supported. */
	labelWidth: {
		type: [String, Number],
		default: "auto",
	},
	/** Suffix of the label. */
	labelSuffix: {
		type: String,
		default: "：",
	},
	/** When validation fails, scroll to the first error form entry. */
	scrollToError: {
		type: Boolean,
		default: true,
	},
	/** 详情From，会删除 FormItem 的 paddinfa-bottom */
	detailForm: Boolean,
	/** Grid布局 */
	grid: {
		type: Boolean,
		default: true,
	},
	/** Grid布局列配置 */
	cols: {
		type: definePropType<string | number | Record<FaLayoutGridBreakpoint, number>>([String, Number, Object]),
		default: () => ({ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }),
	},
};

/** FaForm 的运行时事件定义。 */
export const faFormEmits = {
	...formEmits,
};

/** FaForm 的插槽参数 */
export interface FaFormSlots extends Record<string, unknown> {
	/** 默认内容插槽 */
	default: { cols: Record<FaLayoutGridBreakpoint, number>; gap: [number, number] };
}

export default defineComponent({
	name: "FaForm",
	props: faFormProps,
	emits: faFormEmits,
	slots: makeSlots<FaFormSlots>(),
	setup(props, { slots, expose, emit }) {
		const globalSize = useGlobalSize();
		const formRef = shallowRef<FormInstance | null>(null);

		const state = reactive({
			cols: computed(() => {
				if (typeof props.cols === "object" && props.cols !== null) {
					return props.cols;
				} else {
					const colsNumber = typeof props.cols === "number" ? props.cols : Number(props.cols);
					return { xs: 1, sm: colsNumber, md: colsNumber, lg: colsNumber, xl: colsNumber };
				}
			}),
			gap: computed<[number, number]>(() => (globalSize.value === "small" ? [15, 0] : [20, 0])),
		});

		// 注入 cols
		provide("faFormCols", state.cols);

		// eslint-disable-next-line @typescript-eslint/no-deprecated -- 透传范围必须与继承的 Element Plus 2.x 运行时 props 保持一致。
		const elFormProps = useProps(props, formProps);
		const elFormEmits = useEmits(formEmits, emit);

		useRender(() => (
			<ElForm
				{...elFormProps.value}
				{...elFormEmits.value}
				ref={formRef}
				class={["fa-form", `fa-form-${globalSize.value}`, { [`fa-form-detail fa-form-detail-${globalSize.value}`]: props.detailForm }]}
			>
				{{
					default: () =>
						props.grid ? (
							<FaLayoutGrid collapsed gap={state.gap} cols={state.cols}>
								{slots.default?.(state)}
							</FaLayoutGrid>
						) : (
							slots.default?.(state)
						),
				}}
			</ElForm>
		));

		return useExpose(expose, {
			/** 对整个表单的内容进行验证。 接收一个回调函数，或返回 Promise。 */
			validate: (callback?: FormValidateCallback) =>
				callback ? (formRef.value?.validate(callback) ?? Promise.reject(new Error("ElForm 实例尚未挂载。"))) : formUtil.validate(formRef),
			/** 验证具体的某个字段。 */
			validateField: computed(() => formRef.value?.validateField),
			/** 重置该表单项，将其值重置为初始值，并移除校验结果 */
			resetFields: computed(() => formRef.value?.resetFields),
			/** 清理某个字段的表单验证信息。 */
			clearValidate: computed(() => formRef.value?.clearValidate),
			/** 滚动到指定的字段 */
			scrollToField: computed(() => formRef.value?.scrollToField),
			/** 获取所有字段的 context */
			fields: computed(() => formRef.value?.fields),
			/** 获取指定字段的 context。 */
			getField: computed(() => formRef.value?.getField),
			/** 设置表单字段的初始值。 */
			setInitialValues: computed(() => formRef.value?.setInitialValues),
			/** 对整个表单的内容进行验证，带滚动。 接收一个回调函数，或返回 Promise。 */
			validateScrollToField: () => formUtil.validateScrollToField(formRef),
		});
	},
});
