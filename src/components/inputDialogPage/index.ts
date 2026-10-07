import { withInstall } from "../../utils";
import InputDialogPage, { faInputDialogPageEmits, faInputDialogPageProps } from "./src/inputDialogPage";
import type { ExtractPropTypes } from "vue";
import type { TSXWithInstall } from "../../utils";

/** 在对话框中提供分页选择与输入交互的组件。 */
export const FaInputDialogPage: TSXWithInstall<typeof InputDialogPage> = withInstall(InputDialogPage);
export default FaInputDialogPage;

export { faInputDialogPageProps, faInputDialogPageEmits };
export type { FaInputDialogPageSlots } from "./src/inputDialogPage";

/** FaInputDialogPage 暴露的组件实例类型 */
export type FaInputDialogPageInstance = InstanceType<typeof InputDialogPage>;

/** FaInputDialogPage 的完整 Props 类型 */
export type FaInputDialogPageProps = ExtractPropTypes<typeof faInputDialogPageProps>;

/** FaInputDialogPage 的 Emits 类型 */
export type FaInputDialogPageEmits = typeof faInputDialogPageEmits;
