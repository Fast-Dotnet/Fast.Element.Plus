import { withInstall } from "../../utils";
import Drawer from "./src/drawer";
import type { ExtractPropTypes } from "vue";
import type { TSXWithInstall } from "../../utils";
import type { faDrawerEmits, faDrawerProps } from "./src/drawer";

/** 封装加载、确认与关闭控制的业务抽屉组件。 */
export const FaDrawer: TSXWithInstall<typeof Drawer> = withInstall(Drawer);
export default FaDrawer;

export { faDrawerEmits, faDrawerProps } from "./src/drawer";
export type { FaDrawerSlots } from "./src/drawer";

/** FaDrawer 暴露的组件实例类型 */
export type FaDrawerInstance = InstanceType<typeof Drawer>;

/** FaDrawer 的完整 Props 类型 */
export type FaDrawerProps = ExtractPropTypes<typeof faDrawerProps>;

/** FaDrawer 的 Emits 类型 */
export type FaDrawerEmits = typeof faDrawerEmits;
