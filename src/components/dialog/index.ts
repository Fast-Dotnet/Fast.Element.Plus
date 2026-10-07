import { withInstall } from "../../utils";
import Dialog, { faDialogEmits, faDialogProps } from "./src/dialog";
import type { ExtractPropTypes } from "vue";
import type { TSXWithInstall } from "../../utils";

/** 封装加载、确认与关闭控制的业务对话框组件。 */
export const FaDialog: TSXWithInstall<typeof Dialog> = withInstall(Dialog);
export default FaDialog;

export { faDialogProps, faDialogEmits };
export type { FaDialogSlots } from "./src/dialog";

/** FaDialog 暴露的组件实例类型 */
export type FaDialogInstance = InstanceType<typeof Dialog>;

/** FaDialog 的完整 Props 类型 */
export type FaDialogProps = ExtractPropTypes<typeof faDialogProps>;

/** FaDialog 的 Emits 类型 */
export type FaDialogEmits = typeof faDialogEmits;
