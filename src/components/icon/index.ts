import { withInstall } from "../../utils";
import Icon from "./src/icon";
import type { ExtractPropTypes } from "vue";
import type { TSXWithInstall } from "../../utils";
import type { faIconProps } from "./src/icon";

/** 按名称或组件渲染图标的统一图标组件。 */
export const FaIcon: TSXWithInstall<typeof Icon> = withInstall(Icon);
export default FaIcon;

export { faIconProps } from "./src/icon";

/** FaIcon 暴露的组件实例类型 */
export type FaIconInstance = InstanceType<typeof Icon>;

/** FaIcon 的完整 Props 类型 */
export type FaIconProps = ExtractPropTypes<typeof faIconProps>;
