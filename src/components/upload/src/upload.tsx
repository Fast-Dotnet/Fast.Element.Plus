import { Fragment, computed, defineComponent, shallowRef } from "vue";
import { UploadFilled } from "@element-plus/icons-vue";
import { ElIcon, ElUpload, uploadProps } from "element-plus";
import { definePropType, makeSlots, useExpose, useProps, useRender } from "../../../utils";
import { useUpload } from "./useUpload";
import type { UploadFile, UploadInstance, UploadProps, UploadUserFile } from "element-plus";

/** FaUpload 的运行时 Props 定义 */
export const faUploadProps = {
	// eslint-disable-next-line @typescript-eslint/no-deprecated -- Element Plus 2.x 尚未提供可替代的公开运行时 props 定义。
	...uploadProps,
	/** whether to activate drag and drop mode */
	drag: {
		type: Boolean,
		default: true,
	},
	/** maximum number of uploads allowed */
	limit: {
		type: Number,
		default: 1,
	},
	/** v-model:fileList 绑定值 */
	fileList: {
		type: definePropType<UploadUserFile[]>([Array]),
		default: [],
	},
	/** v-model 绑定值 */
	modelValue: definePropType<string | string[] | null>([String, Array]),
	/** 大小限制，单位kb */
	maxSize: {
		type: definePropType<string | number>([String, Number]),
		default: 5120,
	},
	/** 图片上传接口，优先级最高 */
	uploadApi: {
		type: definePropType<(formData: FormData) => Promise<string>>(Function),
	},
	/** 图片上传地址 */
	uploadUrl: String,
};

/** FaUpload 的运行时 Emits 定义 */
export const faUploadEmits = {
	/** v-model 回调 */
	"update:modelValue": (value: string | string[] | null) => typeof value === "string" || Array.isArray(value) || value === null,
	/** v-model:fileList 回调 */
	"update:fileList": (value: UploadUserFile[]) => Array.isArray(value),
};

/** FaUpload 的插槽参数 */
export interface FaUploadSlots extends Record<string, unknown> {
	/** 默认内容插槽 */
	default: never;
	/** 触发文件选择框的内容 */
	trigger: never;
	/** 提示说明文字 */
	tip: never;
	/** 缩略图模板的内容 */
	file: { file: UploadFile; index: number };
}

export default defineComponent({
	name: "FaUpload",
	props: faUploadProps,
	emits: faUploadEmits,
	slots: makeSlots<FaUploadSlots>(),
	setup(props, { slots, emit, expose }) {
		const {
			fileList,
			loading,
			formContext,
			maxSizeMB,
			handleHttpRequest,
			handleOnSuccess,
			handleOnError,
			handleOnRemove,
			handleOnExceed,
			handleOnUpload,
			handleOnChange,
		} = useUpload("FaUpload", "文件", props, emit, {
			get maxSize() {
				return props.maxSize;
			},
			get uploadApi() {
				return props.uploadApi;
			},
			get uploadUrl() {
				// eslint-disable-next-line @typescript-eslint/no-deprecated -- 需要与 Element Plus 2.x 的运行时默认 action 比较。
				return props.uploadUrl || (props.action === uploadProps.action.default ? undefined : props.action);
			},
		});

		const uploadRef = shallowRef<UploadInstance | null>(null);
		const disabled = computed(() => {
			return props.disabled === true || formContext?.disabled === true;
		});
		// eslint-disable-next-line @typescript-eslint/no-deprecated -- 需要识别 Element Plus 2.x 注入的默认请求实现。
		const httpRequest = computed(() => (props.httpRequest === uploadProps.httpRequest.default ? handleHttpRequest : props.httpRequest));

		const handleBeforeUpload: UploadProps["beforeUpload"] = (rawFile) => {
			if (!handleOnUpload(rawFile)) return false;
			return props.beforeUpload(rawFile);
		};

		// eslint-disable-next-line @typescript-eslint/no-deprecated -- 透传范围必须与继承的 Element Plus 2.x 运行时 props 保持一致。
		const elUploadProps = useProps(props, uploadProps, [
			"fileList",
			"disabled",
			"httpRequest",
			"beforeUpload",
			"onExceed",
			"onSuccess",
			"onError",
			"onRemove",
			"onChange",
		]);

		useRender(() => (
			<ElUpload
				{...elUploadProps.value}
				ref={uploadRef}
				class={["fa-upload", { "fa-upload__trigger": !!slots.trigger }]}
				vLoading={loading.value}
				vModel:fileList={fileList.value}
				disabled={disabled.value || loading.value}
				httpRequest={httpRequest.value}
				beforeUpload={handleBeforeUpload}
				onExceed={handleOnExceed}
				onSuccess={handleOnSuccess}
				onError={handleOnError}
				onRemove={handleOnRemove}
				onChange={handleOnChange}
			>
				{{
					default: () =>
						slots.default ? (
							slots.default()
						) : (
							<Fragment>
								<ElIcon class="el-icon--upload">
									<UploadFilled />
								</ElIcon>
								<div class="el-upload__text">
									{props.drag ? "Drop file here or " : "Select a file or "}
									<em>click to upload</em>
								</div>
							</Fragment>
						),
					...(slots.trigger && { trigger: () => slots.trigger?.() ?? [] }),
					tip: () =>
						slots.tip ? (
							slots.tip()
						) : (
							<Fragment>
								<div class="el-upload__tip">files with a size less than {maxSizeMB.value.toString()}MB</div>
								{!props.showFileList && fileList.value.length > 0 && (
									<div class="el-upload__tip">
										{fileList.value.map((item, index) => (
											<Fragment>
												{item.name}
												{fileList.value.length <= index && <br />}
											</Fragment>
										))}
									</div>
								)}
							</Fragment>
						),
					...(slots.file && {
						file: ({ file, index }: { file: UploadFile; index: number }) => slots.file?.({ file, index }) ?? [],
					}),
				}}
			</ElUpload>
		));

		return useExpose(expose, {
			/** 取消上传请求 */
			abort: computed(() => uploadRef.value?.abort),
			/** 手动上传文件列表 */
			submit: computed(() => uploadRef.value?.submit),
			/** 清空已上传的文件列表（该方法不支持在 before-upload 中调用） */
			clearFiles: computed(() => uploadRef.value?.clearFiles),
			/** 手动选择文件 */
			handleStart: computed(() => uploadRef.value?.handleStart),
			/** 手动移除文件。file 和 rawFile 已被合并。 */
			handleRemove: computed(() => uploadRef.value?.handleRemove),
			/** 加载状态 */
			loading,
			/** 文件集合 */
			fileList,
		});
	},
});
