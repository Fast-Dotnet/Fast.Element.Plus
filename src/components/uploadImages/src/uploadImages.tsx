import { Fragment, computed, defineComponent, reactive, shallowRef } from "vue";
import { Delete, Edit, Plus, ZoomIn } from "@element-plus/icons-vue";
import { ElIcon, ElImageViewer, ElUpload, uploadProps } from "element-plus";
import { FaMimeType } from "../../../constants";
import { definePropType, makeSlots, randomString, useExpose, useProps, useRender, withDefineType } from "../../../utils";
import { useUpload } from "../../upload/src/useUpload";
import type { UploadFile, UploadInstance, UploadProps, UploadUserFile } from "element-plus";

/** FaUploadImages 的运行时 Props 定义 */
export const faUploadImagesProps = {
	// eslint-disable-next-line @typescript-eslint/no-deprecated -- Element Plus 2.x 尚未提供可替代的公开运行时 props 定义。
	...uploadProps,
	/** accepted [file types](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-accept), will not work when `thumbnail-mode === true` */
	accept: {
		type: String,
		default: () => FaMimeType.Image,
	},
	/** type of file list */
	listType: {
		type: definePropType<NonNullable<UploadProps["listType"]>>(String),
		default: "picture-card",
	},
	/** whether uploading multiple files is permitted */
	multiple: {
		type: Boolean,
		default: true,
		validator: (value: boolean) => {
			if (!value) {
				console.warn("[Fast:FaUploadImages]", "'multiple' 属性固定为 true，外部设置不会生效。");
				return false;
			}
			return true;
		},
	},
	/** maximum number of uploads allowed */
	limit: {
		type: Number,
		default: 9,
	},
	/** v-model 绑定值 */
	modelValue: definePropType<string[] | null>([Array]),
	/** 大小限制，单位kb */
	maxSize: {
		type: [String, Number],
		default: 2048,
	},
	/** 图片上传接口，优先级最高 */
	uploadApi: {
		type: definePropType<(formData: FormData) => Promise<string>>(Function),
	},
	/** 图片上传地址 */
	uploadUrl: String,
};

/** FaUploadImages 的运行时 Emits 定义 */
export const faUploadImagesEmits = {
	/** v-model 回调 */
	"update:modelValue": (value: string[] | null) => Array.isArray(value) || value === null,
	/** v-model:fileList 回调 */
	"update:fileList": (value: UploadUserFile[]) => Array.isArray(value),
};

/** FaUploadImages 的插槽参数 */
export interface FaUploadImagesSlots extends Record<string, unknown> {
	/** 默认内容插槽 */
	default: never;
	/** 文件选择触发器 */
	trigger: never;
	/** 上传提示 */
	tip: never;
	/** 文件列表项 */
	file: { file: UploadFile; index: number };
}

export default defineComponent({
	name: "FaUploadImages",
	props: faUploadImagesProps,
	emits: faUploadImagesEmits,
	slots: makeSlots<FaUploadImagesSlots>(),
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
		} = useUpload<string[]>("FaUploadImages", "图片", props, emit, {
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

		const state = reactive({
			uploadKey: `fa-upload-images__${randomString(8)}`,
			preview: false,
			previewIndex: -1,
			previewList: withDefineType<string[]>([]),
		});

		const disabled = computed(() => {
			return props.disabled === true || formContext?.disabled === true;
		});
		// eslint-disable-next-line @typescript-eslint/no-deprecated -- 需要识别 Element Plus 2.x 注入的默认请求实现。
		const httpRequest = computed(() => (props.httpRequest === uploadProps.httpRequest.default ? handleHttpRequest : props.httpRequest));

		const handleEdit = () => {
			const uploadInputEl = document.querySelector(`.${state.uploadKey} .el-upload__input`);
			uploadInputEl?.dispatchEvent(new MouseEvent("click"));
		};

		const handlePreview = (uploadFile: UploadFile) => {
			props.onPreview(uploadFile);
			state.previewIndex = fileList.value.findIndex((f) => f.url === uploadFile.url);
			state.previewList = fileList.value.flatMap((item) => (item.url ? [item.url] : []));
			state.preview = true;
		};

		const handleRemove = (index: number) => {
			const file = fileList.value[index];
			if (file) uploadRef.value?.handleRemove(file as UploadFile);
		};

		const handleBeforeUpload: UploadProps["beforeUpload"] = (rawFile) => {
			if (!handleOnUpload(rawFile)) {
				return false;
			}
			return props.beforeUpload(rawFile);
		};

		// eslint-disable-next-line @typescript-eslint/no-deprecated -- 透传范围必须与继承的 Element Plus 2.x 运行时 props 保持一致。
		const elUploadProps = useProps(props, uploadProps, [
			"fileList",
			"multiple",
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
			<Fragment>
				<ElUpload
					{...elUploadProps.value}
					ref={uploadRef}
					class={["fa-upload-images", state.uploadKey, { "fa-upload-images__hidden-upload": fileList.value.length >= props.limit }]}
					vLoading={loading.value}
					vModel:fileList={fileList.value}
					multiple={true}
					disabled={disabled.value}
					httpRequest={httpRequest.value}
					beforeUpload={handleBeforeUpload}
					onExceed={handleOnExceed}
					onSuccess={handleOnSuccess}
					onError={handleOnError}
					onRemove={handleOnRemove}
					onChange={handleOnChange}
				>
					{{
						...(slots.trigger && { trigger: slots.trigger }),
						default: () =>
							fileList.value.length < props.limit && slots.default ? (
								slots.default()
							) : slots.trigger ? null : (
								<ElIcon>
									<Plus />
								</ElIcon>
							),
						tip: slots.tip ?? (() => <div class="el-upload__tip">files with a size less than {maxSizeMB.value.toString()}MB</div>),
						file:
							slots.file ??
							(({ file, index }: { file: UploadFile; index: number }) => (
								<div>
									<img class="el-upload-list__item-thumbnail" src={file.url} />
									<span class="el-upload-list__item-actions">
										<span class="el-upload-list__item-preview" onClick={() => handlePreview(file)} title="查看">
											<ElIcon>
												<ZoomIn />
											</ElIcon>
										</span>
										{!disabled.value && (
											<Fragment>
												<span class="el-upload-list__item-icon" onClick={handleEdit} title="编辑">
													<ElIcon>
														<Edit />
													</ElIcon>
												</span>
												<span class="el-upload-list__item-icon" onClick={() => handleRemove(index)} title="删除">
													<ElIcon>
														<Delete />
													</ElIcon>
												</span>
											</Fragment>
										)}
									</span>
								</div>
							)),
					}}
				</ElUpload>
				{state.preview && (
					<ElImageViewer
						closeOnPressEscape
						hideOnClickModal
						teleported
						initialIndex={Math.max(state.previewIndex, 0)}
						onClose={() => (state.preview = false)}
						urlList={state.previewList}
					/>
				)}
			</Fragment>
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
			/** 预览 */
			preview: computed(() => state.preview),
			/** 预览集合 */
			previewList: computed(() => state.previewList),
		});
	},
});
