import { withInstall } from "../../utils";
import UploadImage, { faUploadImageEmits, faUploadImageProps } from "./src/uploadImage";
import type { ExtractPropTypes } from "vue";
import type { TSXWithInstall } from "../../utils";

/** 支持预览、校验和状态同步的单图片上传组件。 */
export const FaUploadImage: TSXWithInstall<typeof UploadImage> = withInstall(UploadImage);
export default FaUploadImage;

export { faUploadImageProps, faUploadImageEmits };
export type { FaUploadImageSlots } from "./src/uploadImage";

/** FaUploadImage 暴露的组件实例类型 */
export type FaUploadImageInstance = InstanceType<typeof UploadImage>;

/** FaUploadImage 的完整 Props 类型 */
export type FaUploadImageProps = ExtractPropTypes<typeof faUploadImageProps>;

/** FaUploadImage 的 Emits 类型 */
export type FaUploadImageEmits = typeof faUploadImageEmits;
