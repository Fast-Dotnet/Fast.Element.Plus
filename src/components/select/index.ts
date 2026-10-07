import { withInstall, withNoopInstall } from "../../utils";
import Select, { faSelectProps } from "./src/select";
import SelectOption from "./src/selectOption";
import type { ExtractPropTypes } from "vue";
import type { TSXWithInstall } from "../../utils";
import type { faSelectEmits } from "./src/select";

/** 支持远程数据、分页和自定义选项的选择器组件。 */
export const FaSelect: TSXWithInstall<typeof Select> & { SelectOption: typeof SelectOption } = withInstall(Select, {
	SelectOption,
});
export default FaSelect;

/** 可独立注册的 FaSelect 选项组件。 */
export const FaSelectOption: TSXWithInstall<typeof SelectOption> = withNoopInstall(SelectOption);

export { faSelectProps };
export type { FaSelectSlots } from "./src/select";
export type * from "./src/select.type";

/** FaSelect 暴露的组件实例类型 */
export type FaSelectInstance = InstanceType<typeof Select>;

/** FaSelect 的完整 Props 类型 */
export type FaSelectProps = ExtractPropTypes<typeof faSelectProps>;

/** FaSelect 的 Emits 类型 */
export type FaSelectEmits = typeof faSelectEmits;

/** FaSelectOption 暴露的组件实例类型 */
export type FaSelectOptionInstance = InstanceType<typeof SelectOption>;
