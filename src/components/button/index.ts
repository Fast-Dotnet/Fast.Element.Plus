import { withInstall } from "../../utils";
import Button, { faButtonEmits, faButtonProps } from "./src/button";
import type { ExtractPropTypes } from "vue";
import type { TSXWithInstall } from "../../utils";

/** 支持异步加载状态和全局遮罩联动的按钮组件。 */
export const FaButton: TSXWithInstall<typeof Button> = withInstall(Button);
export default FaButton;

export { faButtonProps, faButtonEmits };
export type { FaButtonSlots } from "./src/button";

/** FaButton 暴露的组件实例类型 */
export type FaButtonInstance = InstanceType<typeof Button>;

/** FaButton 的完整 Props 类型 */
export type FaButtonProps = ExtractPropTypes<typeof faButtonProps>;

/** FaButton 的 Emits 类型 */
export type FaButtonEmits = typeof faButtonEmits;
