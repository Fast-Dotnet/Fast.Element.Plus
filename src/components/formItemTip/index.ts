import { withInstall } from "../../utils";
import FormItemTip, { faFormItemTipProps } from "./src/formItemTip";
import type { ExtractPropTypes } from "vue";
import type { TSXWithInstall } from "../../utils";

/** 为表单项标签提供补充说明的提示组件。 */
export const FaFormItemTip: TSXWithInstall<typeof FormItemTip> = withInstall(FormItemTip);
export default FaFormItemTip;

export { faFormItemTipProps };
export type { FaFormItemTipSlots } from "./src/formItemTip";

/** FaFormItemTip 暴露的组件实例类型 */
export type FaFormItemTipInstance = InstanceType<typeof FormItemTip>;

/** FaFormItemTip 的完整 Props 类型 */
export type FaFormItemTipProps = ExtractPropTypes<typeof faFormItemTipProps>;
