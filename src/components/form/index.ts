import { withInstall, withNoopInstall } from "../../utils";
import Form, { faFormEmits, faFormProps } from "./src/form";
import FormItem, { faFormItemProps } from "./src/formItem";
import type { ExtractPropTypes } from "vue";
import type { TSXWithInstall } from "../../utils";

/** 支持响应式布局和表单项配置的业务表单组件。 */
export const FaForm: TSXWithInstall<typeof Form> & { FormItem: typeof FormItem } = withInstall(Form, {
	FormItem,
});
export default FaForm;

/** 可独立注册的 FaForm 表单项组件。 */
export const FaFormItem: TSXWithInstall<typeof FormItem> = withNoopInstall(FormItem);

export { faFormEmits, faFormProps, faFormItemProps };
export type { FaFormSlots } from "./src/form";
export type { FaFormItemSlots } from "./src/formItem";

/** FaForm 暴露的组件实例类型 */
export type FaFormInstance = InstanceType<typeof Form>;

/** FaForm 的完整 Props 类型 */
export type FaFormProps = ExtractPropTypes<typeof faFormProps>;

/** FaFormItem 暴露的组件实例类型 */
export type FaFormItemInstance = InstanceType<typeof FormItem>;

/** FaFormItem 的完整 Props 类型 */
export type FaFormItemProps = ExtractPropTypes<typeof faFormItemProps>;

export * from "./utils/form";
