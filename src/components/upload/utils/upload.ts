import { ElMessage } from "element-plus";
import { FaMimeType } from "../../../constants";
type UploadData = Record<string, string | Blob | [string | Blob, string] | string[]>;

interface UploadRequestConfig {
	method?: string;
	headers?: HeadersInit;
	withCredentials?: boolean;
}

/** 将 Element Plus 上传附加数据写入 FormData。 */
const appendUploadData = (formData: FormData, params: UploadData): void => {
	for (const [key, value] of Object.entries(params)) {
		if (Array.isArray(value)) {
			if (value.length === 2 && value[0] instanceof Blob && typeof value[1] === "string") {
				formData.append(key, value[0], value[1]);
			} else {
				value.forEach((item) => formData.append(key, item));
			}
		} else {
			formData.append(key, value);
		}
	}
};

const FaMimeTypeNames: Record<string, keyof typeof FaMimeType> = {};

for (const [kName, vAccept] of Object.entries(FaMimeType)) {
	vAccept.split(",").forEach((tItem) => {
		FaMimeTypeNames[tItem.trim()] = kName as keyof typeof FaMimeType;
	});
}

/**
 * 上传工具类
 */
export const uploadUtil = {
	/**
	 * 识别文件类型
	 */
	detectFileType(accept: string): string {
		const detectTypes = new Set<string>();
		accept.split(",").forEach((mimeType) => {
			const normalizedMimeType = mimeType.trim();
			if (normalizedMimeType) detectTypes.add(FaMimeTypeNames[normalizedMimeType] ?? normalizedMimeType);
		});
		return Array.from(detectTypes).join(",");
	},
	/** 判断文件是否符合 HTML accept 规则。 */
	matchesAccept(file: File, accept?: string): boolean {
		if (!accept?.trim()) return true;
		const fileName = file.name.toLowerCase();
		const fileType = file.type.toLowerCase();
		return accept.split(",").some((item) => {
			const rule = item.trim().toLowerCase();
			if (!rule) return false;
			if (rule.startsWith(".")) return fileName.endsWith(rule);
			if (rule.endsWith("/*")) return fileType.startsWith(rule.slice(0, -1));
			return fileType === rule;
		});
	},
	/**
	 * 使用 multipart/form-data 上传文件。
	 * @param url - 地址
	 * @param file - 文件
	 * @param fileName - 文件名称
	 * @param params - 附加表单字段
	 * @param request - 请求头、方法与凭据选项
	 * @returns 响应正文文本
	 * @remarks 地址为空、网络失败或 HTTP 状态失败时，返回的 Promise 被拒绝。
	 */
	async uploadFile(url: string, file: File, fileName: string, params?: UploadData, request?: UploadRequestConfig): Promise<string> {
		if (!url) {
			console.error("[Fast:uploadUtil]", "文件上传地址为空。");
			ElMessage.error("文件上传地址为空！");
			throw new Error("文件上传地址为空！");
		}
		const formData = new FormData();
		formData.append("file", file);
		formData.append("fileName", fileName);
		if (params) appendUploadData(formData, params);
		try {
			const response = await fetch(url, {
				headers: request?.headers,
				method: request?.method ?? "POST",
				credentials: request?.withCredentials ? "include" : "same-origin",
				body: formData,
			});
			if (!response.ok) {
				console.error("[Fast:uploadUtil]", `文件上传失败，HTTP 状态码：${response.status.toString()}。`);
				ElMessage.error("文件上传失败！");
				throw new Error("文件上传失败！");
			}
			return await response.text();
		} catch (error) {
			console.error("[Fast:uploadUtil]", "文件上传失败。", error);
			ElMessage.error("文件上传失败！");
			throw error instanceof Error ? error : new Error("文件上传失败！");
		}
	},
	/**
	 * 通过指定接口上传文件。
	 * @param api - 接收表单数据并返回上传结果的接口
	 * @param file - 文件
	 * @param fileName - 文件名称
	 * @param params - 附加表单字段
	 * @returns 接口返回的上传结果
	 * @remarks 接口未提供或调用失败时，返回的 Promise 被拒绝。
	 */
	async uploadFileByApi(
		api: ((formData: FormData) => Promise<string>) | null | undefined,
		file: File,
		fileName: string,
		params?: UploadData
	): Promise<string> {
		if (!api) {
			console.error("[Fast:uploadUtil]", "文件上传接口为空。");
			ElMessage.error("文件上传接口为空！");
			throw new Error("文件上传接口为空！");
		}
		const formData = new FormData();
		formData.append("file", file);
		formData.append("fileName", fileName);
		if (params) appendUploadData(formData, params);
		try {
			return await api(formData);
		} catch (error) {
			console.error("[Fast:uploadUtil]", "文件上传失败。", error);
			ElMessage.error("文件上传失败！");
			throw error instanceof Error ? error : new Error("文件上传失败！");
		}
	},
};
