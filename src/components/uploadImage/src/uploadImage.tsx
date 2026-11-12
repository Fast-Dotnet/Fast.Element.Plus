import { Fragment, computed, defineComponent, reactive, shallowRef, withModifiers } from "vue";
import { Delete, Edit, UploadFilled, ZoomIn } from "@element-plus/icons-vue";
import { ElIcon, ElImageViewer, ElUpload, uploadProps } from "element-plus";
import { FaMimeType } from "../../../constants";
import { addCssUnit, definePropType, makeSlots, randomString, useExpose, useProps, useRender, withDefineType } from "../../../utils";
import { useUpload } from "../../upload/src/useUpload";
import type { UploadFile, UploadInstance, UploadProps, UploadUserFile } from "element-plus";

/** FaUploadImage 的运行时 Props 定义 */
export const faUploadImageProps = {
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
		default: "picture",
	},
	/** whether uploading multiple files is permitted */
	multiple: {
		type: Boolean,
		default: false,
		validator: (value: boolean) => {
			if (value) {
				console.warn("[Fast:FaUploadImage]", "'multiple' 属性固定为 false，外部设置不会生效。");
				return false;
			}
			return true;
		},
	},
	/** whether to show the uploaded file list */
	showFileList: {
		type: Boolean,
		default: false,
	},
	/** v-model 绑定值 */
	modelValue: definePropType<string | null>(String),
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
	/** 宽度 */
	width: {
		type: [String, Number],
		default: 150,
	},
	/** 高度 */
	height: {
		type: [String, Number],
		default: 150,
	},
};

/** FaUploadImage 的运行时 Emits 定义 */
export const faUploadImageEmits = {
	/** v-model 回调 */
	"update:modelValue": (value: string | null) => typeof value === "string" || value === null,
	/** v-model:fileList 回调 */
	"update:fileList": (value: UploadUserFile[]) => Array.isArray(value),
};

/** FaUploadImage 的插槽参数 */
export interface FaUploadImageSlots extends Record<string, unknown> {
	/** 默认内容插槽 */
	default: never;
	/** 文件选择触发器 */
	trigger: never;
	/** 上传提示 */
	tip: never;
	/** 文件列表项，开启 showFileList 时使用 */
	file: { file: UploadFile; index: number };
}

export default defineComponent({
	name: "FaUploadImage",
	props: faUploadImageProps,
	emits: faUploadImageEmits,
	slots: makeSlots<FaUploadImageSlots>(),
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
		} = useUpload<string>("FaUploadImage", "图片", props, emit, {
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
			uploadKey: `fa-upload-image__${randomString(8)}`,
			preview: false,
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

		const handlePreview = () => {
			const file = fileList.value[0];
			if (!file?.url) return;
			// 文件已由 ElUpload 补齐 uid 和 status。
			if (file.uid !== undefined && file.status !== undefined) props.onPreview({ ...file, uid: file.uid, status: file.status });
			state.previewList = [file.url];
			state.preview = true;
		};

		const handleRemove = () => {
			const file = fileList.value[0];
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
					class={["fa-upload-image", state.uploadKey]}
					style={{
						"--width": addCssUnit(props.width),
						"--height": addCssUnit(props.height),
					}}
					vLoading={loading.value}
					vModel:fileList={fileList.value}
					multiple={false}
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
						...(slots.file && { file: slots.file }),
						default: () =>
							fileList.value.length > 0 ? (
								<Fragment>
									<img class="el-upload-list__item-thumbnail" src={fileList.value[0]?.url} />
									<span
										class="el-upload-list__item-actions"
										onClick={withModifiers(() => {
											return;
										}, ["stop"])}
									>
										<span class="el-upload-list__item-icon" onClick={handlePreview} title="查看">
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
												<span class="el-upload-list__item-icon" onClick={handleRemove} title="删除">
													<ElIcon>
														<Delete />
													</ElIcon>
												</span>
											</Fragment>
										)}
									</span>
								</Fragment>
							) : slots.default ? (
								slots.default()
							) : slots.trigger ? null : (
								<Fragment>
									<ElIcon class="el-icon--upload">
										<UploadFilled />
									</ElIcon>
									<div class="el-upload__text">
										{props.drag && (
											<Fragment>
												Drop file here <br />
											</Fragment>
										)}
										<em>click to upload</em>
									</div>
								</Fragment>
							),
						tip: slots.tip ?? (() => <div class="el-upload__tip">file with a size less than {maxSizeMB.value.toString()}MB</div>),
					}}
				</ElUpload>
				{state.preview && (
					<ElImageViewer
						closeOnPressEscape
						hideOnClickModal
						teleported
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
