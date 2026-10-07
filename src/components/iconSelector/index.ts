import { withInstall } from "../../utils";
import IconSelector from "./src/iconSelector";
import type { TSXWithInstall } from "../../utils";

/** 提供图标检索与选择能力的选择器组件。 */
export const FaIconSelector: TSXWithInstall<typeof IconSelector> = withInstall(IconSelector);
export default FaIconSelector;

/** FaIconSelector 暴露的组件实例类型 */
export type FaIconSelectorInstance = InstanceType<typeof IconSelector>;
