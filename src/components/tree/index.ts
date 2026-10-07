import { withInstall } from "../../utils";
import Tree, { faTreeEmits, faTreeProps } from "./src/tree";
import type { ExtractPropTypes } from "vue";
import type { TSXWithInstall } from "../../utils";

/** 支持远程加载、筛选和节点操作的树组件。 */
export const FaTree: TSXWithInstall<typeof Tree> = withInstall(Tree);
export default FaTree;

export { faTreeProps, faTreeEmits };
export type { FaTreeSlots } from "./src/tree";
export type * from "./src/tree.type";

/** FaTree 暴露的组件实例类型 */
export type FaTreeInstance = InstanceType<typeof Tree>;

/** FaTree 的完整 Props 类型 */
export type FaTreeProps = ExtractPropTypes<typeof faTreeProps>;

/** FaTree 的 Emits 类型 */
export type FaTreeEmits = typeof faTreeEmits;
