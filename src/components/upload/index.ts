import { withInstall } from "../../utils";
import Upload, { faUploadEmits, faUploadProps } from "./src/upload";
import type { ExtractPropTypes } from "vue";
import type { TSXWithInstall } from "../../utils";

/** 统一上传校验、进度和文件列表处理的上传组件。 */
export const FaUpload: TSXWithInstall<typeof Upload> = withInstall(Upload);
export default FaUpload;

export { faUploadProps, faUploadEmits };
export type { FaUploadSlots } from "./src/upload";

/** FaUpload 暴露的组件实例类型 */
export type FaUploadInstance = InstanceType<typeof Upload>;

/** FaUpload 的完整 Props 类型 */
export type FaUploadProps = ExtractPropTypes<typeof faUploadProps>;

/** FaUpload 的 Emits 类型 */
export type FaUploadEmits = typeof faUploadEmits;
