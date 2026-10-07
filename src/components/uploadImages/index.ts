import { withInstall } from "../../utils";
import UploadImages from "./src/uploadImages";
import type { ExtractPropTypes } from "vue";
import type { TSXWithInstall } from "../../utils";
import type { faUploadImagesEmits, faUploadImagesProps } from "./src/uploadImages";

/** 支持排序、预览、校验和状态同步的多图片上传组件。 */
export const FaUploadImages: TSXWithInstall<typeof UploadImages> = withInstall(UploadImages);
export default FaUploadImages;

export { faUploadImagesEmits, faUploadImagesProps } from "./src/uploadImages";
export type { FaUploadImagesSlots } from "./src/uploadImages";

/** FaUploadImages 暴露的组件实例类型 */
export type FaUploadImagesInstance = InstanceType<typeof UploadImages>;

/** FaUploadImages 的完整 Props 类型 */
export type FaUploadImagesProps = ExtractPropTypes<typeof faUploadImagesProps>;

/** FaUploadImages 的 Emits 类型 */
export type FaUploadImagesEmits = typeof faUploadImagesEmits;
