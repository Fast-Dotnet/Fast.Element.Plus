import { withInstall } from "../../utils";
import Image, { faImageEmits, faImageProps } from "./src/image";
import type { ExtractPropTypes } from "vue";
import type { TSXWithInstall } from "../../utils";

/** 支持占位、失败回退和地址处理的图片组件。 */
export const FaImage: TSXWithInstall<typeof Image> = withInstall(Image);
export default FaImage;

export { faImageEmits, faImageProps };
export type { FaImageSlots } from "./src/image";

/** FaImage 暴露的组件实例类型 */
export type FaImageInstance = InstanceType<typeof Image>;

/** FaImage 的完整 Props 类型 */
export type FaImageProps = ExtractPropTypes<typeof faImageProps>;
