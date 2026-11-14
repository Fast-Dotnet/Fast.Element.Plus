import { computed, inject, onMounted, onUnmounted, reactive, ref, useModel, watch } from "vue";
import { ElMessage, ElNotification, formContextKey, formItemContextKey, genFileId, uploadProps } from "element-plus";
import { Decimal } from "decimal.js";
import { uploadUtil } from "../utils/upload";
import type {
	FormContext,
	FormItemContext,
	UploadFile,
	UploadFiles,
	UploadProps,
	UploadRawFile,
	UploadRequestOptions,
	UploadUserFile,
} from "element-plus";
import type { ComputedRef, Ref } from "vue";

interface UploadComposable {
	fileList: Ref<UploadUserFile[]>;
	loading: Ref<boolean>;
	formContext: FormContext | undefined;
	formItemContext: FormItemContext | undefined;
	maxSizeMB: ComputedRef<Decimal>;
	handleValue: () => void;
	getUploadProgress: (file: UploadUserFile) => number | undefined;
	handleHttpRequest: (options: UploadRequestOptions) => Promise<string>;
	handleOnSuccess: (fileUrl: string, uploadFile: UploadFile, uploadFiles: UploadFiles) => void;
	handleOnError: (error: Error, uploadFile: UploadFile, uploadFiles: UploadFiles) => void;
	handleOnRemove: (uploadFile: UploadFile, uploadFiles: UploadFiles) => void;
	handleOnExceed: (files: File[], uploadFiles: UploadUserFile[]) => void;
	handleOnUpload: (file: UploadFile | UploadRawFile) => boolean;
	handleOnChange: (uploadFile: UploadFile, uploadFiles: UploadFiles) => void;
}

/**
 * 创建上传组件共享的文件状态和操作方法。
 *
 * @param componentName - 组件名称。
 * @param fileTypeName - 文件类型名称。
 * @param props - 上传组件的 Props。
 * @param emit - 上传组件的事件触发器。
 * @param data - 上传接口、文件大小限制和图片进度配置。
 * @returns 文件列表、加载状态和上传操作方法。
 */
export const useUpload = <T extends string | string[]>(
	componentName: string,
	fileTypeName: string,
	props: Partial<UploadProps> & {
		fileList: UploadUserFile[];
		modelValue?: T | null;
	},
	emit: ((event: "update:fileList", value: UploadUserFile[]) => void) & ((event: "update:modelValue", value: T | null) => void),
	data?: {
		maxSize?: string | number;
		uploadApi?: (
			formData: FormData,
			onUploadProgress?: (event: {
				/** 已上传的字节数 */
				loaded: number;
				/** 总字节数，无法获取时可以省略 */
				total?: number;
				/** 归一化进度，取值 0 到 1 */
				progress?: number;
			}) => void
		) => Promise<string>;
		uploadUrl?: string;
	}
): UploadComposable => {
	const fileList = useModel(props, "fileList");

	const uploadProgress = reactive(new Map<number, number>());
	const loading = ref(false);
	let activeUploadCount = 0;

	// 获取 el-form 组件上下文
	const formContext = inject(formContextKey, undefined);
	// 获取 el-form-item 组件上下文
	const formItemContext = inject(formItemContextKey, undefined);

	const mbNum = new Decimal(1024);
	const maxSizeKB = computed(() => new Decimal(typeof data?.maxSize === "number" ? data.maxSize : Number(data?.maxSize)));
	const maxSizeMB = computed(() => maxSizeKB.value.div(mbNum));

	onMounted(() => {
		// eslint-disable-next-line @typescript-eslint/no-deprecated -- 需要识别 Element Plus 2.x 注入的默认请求实现。
		if (!props.disabled && props.autoUpload && !data?.uploadApi && !data?.uploadUrl && props.httpRequest === uploadProps.httpRequest.default) {
			console.error(`[Fast:${componentName}]`, "uploadApi 和 uploadUrl 至少需要提供一个。");
		}
	});

	onUnmounted(() => {
		uploadProgress.clear();
	});

	const getUploadedUrls = (files: UploadUserFile[]): string[] =>
		files.flatMap(({ url, status }) => (url && (!status || status === "success") ? [url] : []));

	const handleValue = (files: UploadUserFile[] = fileList.value): void => {
		let value: T | null;
		if (files.length > 0) {
			if (props.multiple === true) {
				value = getUploadedUrls(files) as T;
			} else {
				const fileUrl = files[0]?.url;
				if (!fileUrl) return;
				value = fileUrl as T;
			}
		} else {
			value = props.multiple === true ? ([] as unknown as T) : null;
		}
		emit("update:modelValue", value);
	};

	const getUploadProgress = (file: UploadUserFile): number | undefined => {
		if (file.uid === undefined) return;
		const percent = uploadProgress.get(file.uid);
		if (percent !== undefined) {
			return percent;
		} else if (file.status === "uploading") {
			return file.percentage ?? 0;
		}
	};

	const handleHttpRequest = async (options: UploadRequestOptions): Promise<string> => {
		if (!data?.uploadApi && !data?.uploadUrl) {
			const error = new Error(`上传${fileTypeName}接口 uploadApi 或地址 uploadUrl 不能为空。`);
			ElMessage.error(`上传${fileTypeName}Api或地址不能为空`);
			console.error(`[Fast:${componentName}]`, error.message);
			throw error;
		}

		activeUploadCount++;
		loading.value = true;
		const uid = options.file.uid;
		uploadProgress.set(uid, 0);
		const onUploadProgress = (event: { loaded: number; total?: number; progress?: number }): void => {
			if (!uploadProgress.has(uid)) return;
			const { loaded, total, progress } = event;
			const ratio = total !== undefined && total > 0 ? loaded / total : progress;
			if (ratio !== undefined && !Number.isFinite(ratio)) return;
			const percent = ratio === undefined ? (uploadProgress.get(uid) ?? 0) : Math.min(100, Math.max(0, ratio * 100));
			uploadProgress.set(uid, Math.round(percent));
			const progressEvent =
				event instanceof ProgressEvent
					? event
					: new ProgressEvent("progress", { loaded, total, lengthComputable: total !== undefined && total > 0 });
			options.onProgress(Object.assign(progressEvent, { percent }));
		};
		try {
			if (data.uploadApi) {
				return await uploadUtil.uploadFileByApi(data.uploadApi, options.file, options.filename, options.data, onUploadProgress);
			}
			const headers =
				options.headers instanceof Headers
					? options.headers
					: new Headers(
							Object.entries(options.headers).flatMap(([key, value]) =>
								value === null || value === undefined ? [] : [[key, String(value)] as [string, string]]
							)
						);
			return await uploadUtil.uploadFile(data.uploadUrl ?? options.action, options.file, options.filename, options.data, {
				headers,
				method: options.method,
				withCredentials: options.withCredentials,
				onUploadProgress,
			});
		} finally {
			uploadProgress.delete(uid);
			activeUploadCount = Math.max(activeUploadCount - 1, 0);
			loading.value = activeUploadCount > 0;
		}
	};

	const handleOnSuccess = (fileUrl: string, uploadFile: UploadFile, uploadFiles: UploadFiles): void => {
		if (!fileUrl) return;
		uploadFile.url = fileUrl;
		if (!props.multiple && uploadFiles.length > 1) {
			uploadFiles.splice(0, uploadFiles.length, uploadFile);
		}
		handleValue(uploadFiles);
		// 调用 el-form 内部的校验方法（可自动校验）
		if (formItemContext?.prop) formContext?.validateField([formItemContext.prop]);
		ElMessage.success("上传成功");
		props.onSuccess?.(fileUrl, uploadFile, uploadFiles);
	};

	const handleOnError = (error: Error, uploadFile: UploadFile, uploadFiles: UploadFiles): void => {
		ElNotification({
			message: `【${uploadFile.name}】${fileTypeName}上传失败，请您重新上传`,
			type: "error",
		});
		props.onError?.(error, uploadFile, uploadFiles);
	};

	const handleOnRemove = (uploadFile: UploadFile, uploadFiles: UploadFiles): void => {
		uploadProgress.delete(uploadFile.uid);
		handleValue(uploadFiles);
		props.onRemove?.(uploadFile, uploadFiles);
	};

	const handleOnExceed = (files: File[], uploadFiles: UploadUserFile[]): void => {
		ElMessage.warning(`最多只能上传 ${props.limit} 个${fileTypeName}，请移除后再进行上传`);
		props.onExceed?.(files, uploadFiles);
	};

	const handleOnUpload = (file: UploadFile | UploadRawFile): boolean => {
		const fileSizeKB = new Decimal(file.size ?? 0).div(mbNum);

		if (fileSizeKB.greaterThan(maxSizeKB.value)) {
			console.warn(`[Fast:${componentName}]`, `【${file.name}】${fileTypeName}上传大小不能超过 ${maxSizeMB.value.toString()}MB。`);
			ElMessage.warning(`【${file.name}】${fileTypeName}上传大小不能超过 ${maxSizeMB.value.toString()}MB`);
			return false;
		}

		const rawFile = "type" in file ? file : file.raw;
		if (!rawFile) return false;
		if (!uploadUtil.matchesAccept(rawFile, props.accept)) {
			const uploadFileNames = uploadUtil.detectFileType(props.accept ?? "");
			console.warn(`[Fast:${componentName}]`, `只允许上传【${uploadFileNames}】格式的${fileTypeName}。`);
			ElMessage.warning(`只允许上传【${uploadFileNames}】格式的${fileTypeName}`);
			return false;
		}

		return true;
	};

	const handleOnChange = (uploadFile: UploadFile, uploadFiles: UploadFiles): void => {
		if (props.autoUpload === false && uploadFile.status === "ready" && !handleOnUpload(uploadFile)) {
			fileList.value = uploadFiles.filter((item) => item.uid !== uploadFile.uid);
			return;
		}
		props.onChange?.(uploadFile, uploadFiles);
	};

	/**
	 * 监听 v-model 绑定数据
	 */
	watch(
		() => props.modelValue,
		(newValue) => {
			if (newValue) {
				if (Array.isArray(newValue)) {
					const uploadedUrls = getUploadedUrls(fileList.value);
					// 组件回写已完成的 URL 时，保留文件顺序和仍在上传的卡片。
					if (newValue.length === uploadedUrls.length && newValue.every((url, index) => url === uploadedUrls[index])) return;
					fileList.value = newValue.map((m) => {
						const find = fileList.value.find((f) => f.url === m);
						const urlWithoutParams = m.split(/[?#]/u)[0] ?? "";
						const fileName = urlWithoutParams.slice(urlWithoutParams.lastIndexOf("/") + 1);
						return (
							find ?? {
								name: fileName,
								status: "success",
								uid: genFileId(),
								url: m,
							}
						);
					});
				} else {
					const find = fileList.value.find((f) => f.url === newValue);
					const urlWithoutParams = newValue.split(/[?#]/u)[0] ?? "";
					const fileName = urlWithoutParams.slice(urlWithoutParams.lastIndexOf("/") + 1);
					fileList.value = [
						find ?? {
							name: fileName,
							status: "success",
							uid: genFileId(),
							url: newValue,
						},
					];
				}
			} else {
				fileList.value = [];
			}
		},
		{
			immediate: true,
		}
	);

	return {
		fileList,
		loading,
		formContext,
		formItemContext,
		maxSizeMB,
		handleValue,
		getUploadProgress,
		handleHttpRequest,
		handleOnSuccess,
		handleOnError,
		handleOnRemove,
		handleOnExceed,
		handleOnUpload,
		handleOnChange,
	};
};
