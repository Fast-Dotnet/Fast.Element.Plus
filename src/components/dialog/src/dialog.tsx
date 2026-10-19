import { Fragment, computed, defineComponent, nextTick, reactive, shallowRef, toRef, watch } from "vue";
import { Close, Eleme, Refresh } from "@element-plus/icons-vue";
import { ElButton, ElDialog, ElIcon, ElMessage, ElMessageBox, ElScrollbar, dialogEmits, dialogProps, useGlobalSize } from "element-plus";
import { FullScreen, FullScreenExit } from "@fast-element-plus/icons-vue";
import { callOptionalFunction, definePropType, makeSlots, useEmits, useExpose, useProps, useRender } from "../../../utils";
import type { DialogInstance } from "element-plus";

/** FaDialog 的运行时 Props 定义 */
export const faDialogProps = {
	// eslint-disable-next-line @typescript-eslint/no-deprecated -- Element Plus 2.x 尚未提供可替代的公开运行时 props 定义。
	...dialogProps,
	/** whether to align the dialog both horizontally and vertically */
	alignCenter: {
		type: Boolean,
		default: true,
	},
	/** whether to append Dialog itself to body. A nested Dialog should have this attribute set to `true` */
	appendToBody: {
		type: Boolean,
		default: true,
	},
	/** enable dragging feature for Dialog */
	draggable: {
		type: Boolean,
		default: true,
	},
	/** destroy elements in Dialog when closed */
	destroyOnClose: {
		type: Boolean,
		default: true,
	},
	/** draggable Dialog can overflow the viewport */
	overflow: {
		type: Boolean,
		default: true,
	},
	/** value for `margin-top` of Dialog CSS, default is 15vh */
	top: {
		type: String,
		default: "5vh",
	},
	/** width of Dialog, default is 50% */
	width: {
		type: [String, Number],
		default: "90%",
	},
	/** 显示刷新按钮 */
	showRefresh: {
		type: Boolean,
		default: true,
	},
	/** 显示全屏图标 */
	showFullscreen: {
		type: Boolean,
		default: true,
	},
	/** 显示关闭按钮 */
	showCloseButton: {
		type: Boolean,
		default: true,
	},
	/** 显示确认按钮 */
	showConfirmButton: {
		type: Boolean,
		default: true,
	},
	/** 禁用确认按钮 */
	disabledConfirmButton: Boolean,
	/** 关闭按钮文字，默认取消 */
	closeButtonText: {
		type: String,
		default: "取消",
	},
	/** 确认按钮文字，默认确认 */
	confirmButtonText: {
		type: String,
		default: "确认",
	},
	/** 隐藏底部操作 */
	hideFooter: Boolean,
	/** 撑满高度 */
	fullHeight: Boolean,
	/** 显示关闭回调 */
	showBeforeClose: Boolean,
	/** 打开之后 */
	afterOpen: {
		type: definePropType<() => void | Promise<void>>(Function),
	},
};

/** FaDialog 的运行时 Emits 定义 */
export const faDialogEmits = {
	...dialogEmits,
	/** v-model 回调 */
	"update:modelValue": (value: boolean) => typeof value === "boolean",
	/** 确认按钮点击事件 */
	confirmClick: () => true,
};

/** FaDialog 的插槽参数 */
export interface FaDialogSlots extends Record<string, unknown> {
	/** 默认内容插槽 */
	default: { loading: boolean };
	/** 头部插槽 */
	header: { loading: boolean; close: () => void; titleId: string; titleClass: string };
	/** 标题插槽 */
	title: { loading: boolean; close: () => void; titleId: string; titleClass: string };
	/** 底部插槽 */
	footer: { loading: boolean; close: () => void };
}

export default defineComponent({
	name: "FaDialog",
	props: faDialogProps,
	emits: faDialogEmits,
	slots: makeSlots<FaDialogSlots>(),
	setup(props, { slots, emit, expose }) {
		const globalSize = useGlobalSize();
		const dialogRef = shallowRef<DialogInstance | null>(null);

		const state = reactive({
			loading: false,
			visible: false,
			fullscreen: false,
			refreshing: false,
		});

		let cacheOpenFunction: (() => void | Promise<void>) | undefined;

		const handleOpen = async (openFunction?: () => void | Promise<void>) => {
			state.visible = true;
			cacheOpenFunction = openFunction;
			await nextTick();
			state.loading = true;
			try {
				await callOptionalFunction(props.afterOpen ?? openFunction);
				emit("open");
			} catch (error) {
				state.visible = false;
				throw error;
			} finally {
				state.loading = false;
			}
		};

		const handleClose = async (closeFunction?: () => void | Promise<void>) => {
			state.loading = true;
			try {
				await callOptionalFunction(closeFunction);
				emit("close");
				state.visible = false;
			} finally {
				state.loading = false;
			}
		};

		const handleLoading = async (loadingFunction: () => void | Promise<void>) => {
			state.loading = true;
			try {
				await callOptionalFunction(loadingFunction);
			} finally {
				state.loading = false;
			}
		};

		const handleRefresh = async () => {
			if (state.loading) return;
			state.refreshing = true;
			state.loading = true;
			try {
				await new Promise<void>((resolve) => {
					setTimeout(resolve, 500);
				});
				state.refreshing = false;
				await handleOpen(cacheOpenFunction);
				ElMessage.success("刷新成功");
			} finally {
				state.refreshing = false;
				state.loading = false;
			}
		};

		const handleBeforeClose = (done: () => void) => {
			if (state.loading) return;
			// 解决 image 预览摁下 ese 会关闭弹窗的问题
			if (document.querySelector(".el-image-viewer__wrapper")) return;

			const newDone = () => {
				// 组件对外约定为无参数完成钩子，不采用 Element Plus 的 done 回调签名。
				return callOptionalFunction(props.beforeClose, done).then(() => {
					emit("close");
					done();
				});
			};

			if (props.showBeforeClose) {
				// 用户取消关闭属于正常分支，无需继续执行 beforeClose。
				ElMessageBox.confirm("确定关闭？", { type: "warning" }).then(() => newDone());
			} else {
				newDone();
			}
		};

		const handleFullscreen = () => {
			if (state.loading) return;
			state.fullscreen = !state.fullscreen;
		};

		const handleConfirmClick = () => {
			if (state.loading) return;
			emit("confirmClick");
		};

		const handleCloseClick = () => {
			if (state.loading) return;
			handleClose();
		};

		watch(
			() => state.visible,
			(newValue) => {
				emit("update:modelValue", newValue);
			}
		);

		// eslint-disable-next-line @typescript-eslint/no-deprecated -- 透传范围必须与继承的 Element Plus 2.x 运行时 props 保持一致。
		const elDialogProps = useProps(props, dialogProps, ["modelValue", "fullscreen", "showClose", "beforeClose"]);
		// open、close 是 Fast 异步业务流程完成事件，不直接透传 Element Plus 的同名生命周期事件。
		const elDialogEmits = useEmits(dialogEmits, emit, ["open", "close", "update:modelValue"]);

		useRender(() => (
			<ElDialog
				{...elDialogProps.value}
				{...elDialogEmits.value}
				ref={dialogRef}
				class={[
					"fa-dialog",
					`fa-dialog-${globalSize.value}`,
					{ "fa-dialog__full-height": props.fullHeight, "fa-dialog__fullscreen": state.fullscreen },
				]}
				vModel={state.visible}
				fullscreen={state.fullscreen}
				showClose={false}
				beforeClose={handleBeforeClose}
			>
				{{
					header: ({ titleId, titleClass }: { close: () => void; titleId: string; titleClass: string }) => (
						<Fragment>
							<div id={titleId} class={["fa-dialog__header-title", titleClass]}>
								{slots.title?.({ loading: state.loading, close: handleCloseClick, titleId, titleClass }) ?? props.title}
								{slots.header?.({ loading: state.loading, close: handleCloseClick, titleId, titleClass })}
							</div>
							{props.showRefresh && (
								<div
									title="刷新"
									class={[
										"fa-dialog__header-icon",
										state.loading ? "fa__click__disabled fa__click__disabled__cursor " : "fa__hover__twinkle",
									]}
									onClick={handleRefresh}
								>
									<ElIcon>
										<Refresh />
									</ElIcon>
								</div>
							)}
							{props.showFullscreen && (
								<div
									title={state.fullscreen ? "关闭全屏显示" : "全屏显示"}
									class={[
										"fa-dialog__header-icon",
										state.loading ? "fa__click__disabled fa__click__disabled__cursor " : "fa__hover__twinkle",
									]}
									onClick={handleFullscreen}
								>
									<ElIcon>{state.fullscreen ? <FullScreenExit /> : <FullScreen />}</ElIcon>
								</div>
							)}
							{props.showClose && (
								<div
									title="关闭"
									class={[
										"fa-dialog__header-icon",
										state.loading ? "fa__click__disabled fa__click__disabled__cursor " : "fa__hover__twinkle",
									]}
									onClick={handleCloseClick}
								>
									<ElIcon>
										<Close />
									</ElIcon>
								</div>
							)}
						</Fragment>
					),
					default: () => (
						<ElScrollbar viewClass="fa-dialog__scrollbar-view" vLoading={state.loading} element-loading-text="加载中...">
							{!state.refreshing && slots.default?.(state)}
						</ElScrollbar>
					),
					...(!props.hideFooter && {
						footer: () => [
							<Fragment>
								{slots.footer?.({ loading: state.loading, close: handleCloseClick })}
								{props.showCloseButton && (
									<ElButton disabled={state.loading} onClick={handleCloseClick}>
										{props.closeButtonText}
									</ElButton>
								)}
								{props.showConfirmButton && (
									<ElButton
										loading={state.loading}
										loadingIcon={Eleme}
										disabled={props.disabledConfirmButton}
										type="primary"
										onClick={handleConfirmClick}
									>
										{state.loading ? "加载中..." : props.confirmButtonText}
									</ElButton>
								)}
							</Fragment>,
						],
					}),
				}}
			</ElDialog>
		));

		return useExpose(expose, {
			/** 调用原生关闭流程，并执行 beforeClose。 */
			handleClose: computed(() => dialogRef.value?.handleClose),
			/** 弹窗内容引用 */
			dialogContentRef: computed<{ resetPosition: () => void; updatePosition: () => void } | undefined>(
				() => dialogRef.value?.dialogContentRef as { resetPosition: () => void; updatePosition: () => void } | undefined
			),
			/** 重置位置 */
			resetPosition: computed(() => dialogRef.value?.resetPosition),
			/** 加载状态 */
			loading: toRef(state, "loading"),
			/** 是否显示 */
			visible: toRef(state, "visible"),
			/** 打开弹窗 */
			open: handleOpen,
			/** 关闭弹窗 */
			close: handleClose,
			/** 刷新弹窗 */
			refresh: handleRefresh,
			/** 弹窗加载 */
			doLoading: handleLoading,
		});
	},
});
