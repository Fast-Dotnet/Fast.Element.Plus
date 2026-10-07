import { withInstall } from "../../utils";
import TreeSelect, { faTreeSelectEmits, faTreeSelectProps } from "./src/treeSelect";
import type { ExtractPropTypes } from "vue";
import type { TSXWithInstall } from "../../utils";

/** 组合树结构浏览与选择交互的树选择器组件。 */
export const FaTreeSelect: TSXWithInstall<typeof TreeSelect> = withInstall(TreeSelect);
export default FaTreeSelect;

export { faTreeSelectProps, faTreeSelectEmits };
export type { FaTreeSelectSlots } from "./src/treeSelect";

/** FaTreeSelect 暴露的组件实例类型 */
export type FaTreeSelectInstance = InstanceType<typeof TreeSelect>;

/** FaTreeSelect 的完整 Props 类型 */
export type FaTreeSelectProps = ExtractPropTypes<typeof faTreeSelectProps>;

/** FaTreeSelect 的 Emits 类型 */
export type FaTreeSelectEmits = typeof faTreeSelectEmits;
