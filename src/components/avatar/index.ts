import { withInstall } from "../../utils";
import Avatar from "./src/avatar";
import type { ExtractPropTypes } from "vue";
import type { TSXWithInstall } from "../../utils";
import type { faAvatarEmits, faAvatarProps } from "./src/avatar";

/** 支持图片地址规格转换的头像组件。 */
export const FaAvatar: TSXWithInstall<typeof Avatar> = withInstall(Avatar);
export default FaAvatar;

export { faAvatarEmits, faAvatarProps } from "./src/avatar";
export type { FaAvatarSlots } from "./src/avatar";

/** FaAvatar 暴露的组件实例类型 */
export type FaAvatarInstance = InstanceType<typeof Avatar>;

/** FaAvatar 的完整 Props 类型 */
export type FaAvatarProps = ExtractPropTypes<typeof faAvatarProps>;

/** FaAvatar 的 Emits 类型 */
export type FaAvatarEmits = typeof faAvatarEmits;
