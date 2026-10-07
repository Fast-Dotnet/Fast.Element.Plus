import { withInstall, withNoopInstall } from "../../utils";
import LayoutGrid from "./src/layoutGrid";
import LayoutGridItem from "./src/layoutGridItem";
import type { TSXWithInstall } from "../../utils";

/** 根据断点和容器宽度排列内容的响应式布局组件。 */
export const FaLayoutGrid: TSXWithInstall<typeof LayoutGrid> & { LayoutGridItem: typeof LayoutGridItem } = withInstall(LayoutGrid, {
	LayoutGridItem,
});
export default FaLayoutGrid;

/** 可独立注册的响应式布局项组件。 */
export const FaLayoutGridItem: TSXWithInstall<typeof LayoutGridItem> = withNoopInstall(LayoutGridItem);

export type * from "./src/layoutGrid.type";
export type { FaLayoutGridSlots } from "./src/layoutGrid";
export type { FaLayoutGridItemSlots } from "./src/layoutGridItem";

/** FaLayoutGrid 暴露的组件实例类型 */
export type FaLayoutGridInstance = InstanceType<typeof LayoutGrid>;

/** FaLayoutGridItem 暴露的组件实例类型 */
export type FaLayoutGridItemInstance = InstanceType<typeof LayoutGridItem>;
