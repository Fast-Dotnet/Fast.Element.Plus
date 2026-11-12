import { computed, defineComponent, reactive, shallowRef, watch } from "vue";
import { Picture as ElIconPicture } from "@element-plus/icons-vue";
import { ElIcon, ElImage, imageEmits, imageProps } from "element-plus";
import { makeSlots, useEmits, useExpose, useProps, useRender } from "../../../utils";
import type { ImageInstance, ImageViewerAction } from "element-plus";

/** FaImage 的运行时 Props 定义 */
export const faImageProps = {
	// eslint-disable-next-line @typescript-eslint/no-deprecated -- Element Plus 2.x 尚未提供可替代的公开运行时 props 定义。
	...imageProps,
	/** when enabling preview, use this flag to control whether clicking on backdrop can exit preview mode. */
	hideOnClickModal: {
		type: Boolean,
		default: true,
	},
	/** whether to append image-viewer to body. A nested parent element attribute transform should have this attribute set to `true`. */
	previewTeleported: {
		type: Boolean,
		default: true,
	},
	/** whether to use lazy load. */
	lazy: {
		type: Boolean,
		default: true,
	},
	/** Base64图片 */
	base64: Boolean,
	/** 原图 */
	original: Boolean,
	/** 标准 */
	normal: Boolean,
	/** 小图 */
	small: Boolean,
	/** 缩略图 */
	thumb: Boolean,
	/** 是否可以预览图片 */
	preview: {
		type: Boolean,
		default: true,
	},
};

/** FaImage 的运行时事件定义。 */
export const faImageEmits = {
	...imageEmits,
};

/** FaImage 的插槽参数 */
export interface FaImageSlots extends Record<string, unknown> {
	/** 当图像尚未加载时，自定义的占位符内容 */
	placeholder: never;
	/** 自定义图像加载失败的内容 */
	error: never;
	/** 当图像预览时自定义内容 */
	viewer: { src?: string };
	/** 图片预览进度内容 */
	progress: { activeIndex: number; total: number };
	/** 图片预览工具栏内容 */
	toolbar: {
		actions: (action: ImageViewerAction, options?: Record<string, never>) => void;
		prev: () => void;
		next: () => void;
		reset: () => void;
		activeIndex: number;
		setActiveItem: (index: number) => void;
	};
	/** 图片预览加载失败内容 */
	viewerError: { activeIndex: number; src: string };
	/** 图片预览加载时的占位内容 */
	viewerPlaceholder: { activeIndex: number; src: string };
}

export default defineComponent({
	name: "FaImage",
	props: faImageProps,
	emits: faImageEmits,
	slots: makeSlots<FaImageSlots>(),
	setup(props, { slots, emit, expose }) {
		const imageRef = shallowRef<ImageInstance | null>(null);

		const state = reactive({
			/** 图片加载错误 */
			loadError: false,
			src: computed(() => {
				if (!props.src) return undefined;
				if (props.base64) {
					return `data:image/png;base64,${props.src}`;
				} else if (props.original || state.loadError) {
					return props.src;
				} else if (props.normal) {
					return `${props.src}@!normal`;
				} else if (props.small) {
					return `${props.src}@!small`;
				} else if (props.thumb) {
					return `${props.src}@!thumb`;
				} else {
					// 默认使用缩略图
					return `${props.src}@!thumb`;
				}
			}),
			previewList: computed(() => {
				if (!props.preview) return [];
				if (props.previewSrcList.length > 0) return props.previewSrcList;
				return props.src ? [props.base64 ? `data:image/png;base64,${props.src}` : props.src] : [];
			}),
		});

		watch(
			() => props.src,
			() => {
				state.loadError = false;
			}
		);

		// eslint-disable-next-line @typescript-eslint/no-deprecated -- 透传范围必须与继承的 Element Plus 2.x 运行时 props 保持一致。
		const bindProps = useProps(props, imageProps, ["src", "previewSrcList"]);
		const bindEmits = useEmits(imageEmits, emit, ["error"]);

		useRender(() => (
			<ElImage
				{...bindProps.value}
				{...bindEmits.value}
				class="fa-image"
				ref={imageRef}
				src={state.src}
				previewSrcList={state.previewList}
				onError={(event) => {
					state.loadError ||= true;
					emit("error", event);
				}}
			>
				{{
					error: () =>
						slots.error ? (
							slots.error()
						) : (
							<div class="fa-image__error-image">
								<ElIcon class="icon">
									<ElIconPicture />
								</ElIcon>
							</div>
						),
					...(slots.placeholder && { placeholder: () => slots.placeholder?.() ?? [] }),
					...(slots.viewer && { viewer: () => slots.viewer?.({ src: state.src }) ?? [] }),
					...(slots.progress && {
						progress: (scope: { activeIndex: number; total: number }) => slots.progress?.(scope) ?? [],
					}),
					...(slots.toolbar && {
						toolbar: (scope: FaImageSlots["toolbar"]) => slots.toolbar?.(scope) ?? [],
					}),
					...(slots.viewerError && { "viewer-error": slots.viewerError }),
					...(slots.viewerPlaceholder && { "viewer-placeholder": slots.viewerPlaceholder }),
				}}
			</ElImage>
		));

		return useExpose(expose, {
			/** 手动打开图片预览。 */
			showPreview: computed(() => imageRef.value?.showPreview),
		});
	},
});
