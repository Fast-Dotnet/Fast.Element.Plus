import { withInstall } from "../../utils";
import SelectPage, { faSelectPageEmits, faSelectPageProps } from "./src/selectPage";
import type { ExtractPropTypes } from "vue";
import type { TSXWithInstall } from "../../utils";

/** 支持分页数据源和远程检索的选择器组件。 */
export const FaSelectPage: TSXWithInstall<typeof SelectPage> = withInstall(SelectPage);
export default FaSelectPage;

export { faSelectPageProps, faSelectPageEmits };
export type { FaSelectPageSlots } from "./src/selectPage";

/** FaSelectPage 暴露的组件实例类型 */
export type FaSelectPageInstance = InstanceType<typeof SelectPage>;

/** FaSelectPage 的完整 Props 类型 */
export type FaSelectPageProps = ExtractPropTypes<typeof faSelectPageProps>;

/** FaSelectPage 的 Emits 类型 */
export type FaSelectPageEmits = typeof faSelectPageEmits;
