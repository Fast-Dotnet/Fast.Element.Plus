import { withInstall } from "../../utils";
import SelectV2, { SelectV2Props, faSelectV2Props } from "./src/selectV2";
import type { ExtractPropTypes } from "vue";
import type { TSXWithInstall } from "../../utils";
import type { faSelectV2Emits } from "./src/selectV2";

/** 面向大数据量选项并支持远程分页的虚拟化选择器组件。 */
export const FaSelectV2: TSXWithInstall<typeof SelectV2> = withInstall(SelectV2);
export default FaSelectV2;

export { SelectV2Props, faSelectV2Props };
export type { FaSelectV2Slots } from "./src/selectV2";

/** FaSelectV2 暴露的组件实例类型 */
export type FaSelectV2Instance = InstanceType<typeof SelectV2>;

/** FaSelectV2 的完整 Props 类型 */
export type FaSelectV2Props = ExtractPropTypes<typeof faSelectV2Props>;

/** FaSelectV2 的 Emits 类型 */
export type FaSelectV2Emits = typeof faSelectV2Emits;
