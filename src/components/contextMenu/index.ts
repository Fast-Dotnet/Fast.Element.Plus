import { withInstall } from "../../utils";
import ContextMenu from "./src/contextMenu";
import type { TSXWithInstall } from "../../utils";

/** 支持定位和嵌套操作项的右键菜单组件。 */
export const FaContextMenu: TSXWithInstall<typeof ContextMenu> = withInstall(ContextMenu);
export default FaContextMenu;

export type * from "./src/contextMenu.type";

/** FaContextMenu 暴露的组件实例类型 */
export type FaContextMenuInstance = InstanceType<typeof ContextMenu>;
