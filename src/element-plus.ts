/** Element Plus 组件全局配置 */

import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import ElementPlus, { ElDialog, ElForm, ElInput, ElInputNumber, ElMessageBox, ElSelect, ElTable, ElTree, ElTreeSelect } from "element-plus";
import { useOverlay } from "./hooks";
import { callOptionalFunction } from "./utils";
import type { Action, ElMessageBoxOptions, ElMessageBoxShortcutMethod, MessageBoxData, MessageBoxState } from "element-plus";
import type { App, AppContext } from "vue";

/* Element Plus 默认值设置。 */
ElDialog.setPropsDefaults({
	/** 默认拖拽。 */
	draggable: true,
});

ElForm.setPropsDefaults({
	/** 默认标签宽度。 */
	labelWidth: "auto",
	/** 默认标签后缀。 */
	labelSuffix: "：",
	/** 校验失败时默认滚动到第一个错误表单项。 */
	scrollToError: true,
});

ElInput.setPropsDefaults({
	/** 默认显示字数统计。 */
	showWordLimit: true,
});

ElInputNumber.setPropsDefaults({
	/** 默认不显示控制按钮。 */
	controls: false,
	/** 默认左对齐。 */
	align: "left",
});

ElSelect.setPropsDefaults({
	/** 默认加载提示。 */
	loadingText: "加载中...",
	/** 默认无匹配数据提示。 */
	noMatchText: "暂无匹配的数据",
	/** 默认无数据提示。 */
	noDataText: "暂无数据",
	/** 多选时默认折叠标签。 */
	collapseTags: true,
	/** 默认在悬停折叠标签时显示完整内容。 */
	collapseTagsTooltip: true,
});

ElTable.setPropsDefaults({
	/** 默认显示边框。 */
	border: true,
	/** 默认高亮当前行。 */
	highlightCurrentRow: true,
	/** 默认行 Key。 */
	rowKey: "id",
});

ElTree.setPropsDefaults({
	/** 默认展开所有节点。 */
	defaultExpandAll: true,
	/** 默认点击时选中节点。 */
	checkOnClickNode: true,
	/** 默认高亮当前节点。 */
	highlightCurrent: true,
});

ElTreeSelect.setPropsDefaults({
	/** 默认加载提示。 */
	loadingText: "加载中...",
	/** 默认无匹配数据提示。 */
	noMatchText: "暂无匹配的数据",
	/** 默认无数据提示。 */
	noDataText: "暂无数据",
	/** 多选时默认折叠标签。 */
	collapseTags: true,
	/** 默认在悬停折叠标签时显示完整内容。 */
	collapseTagsTooltip: true,
	/** 默认展开所有节点。 */
	defaultExpandAll: true,
	/** 默认点击时选中节点。 */
	checkOnClickNode: true,
	/** 默认高亮当前节点。 */
	highlightCurrent: true,
	/** 默认仅通过箭头展开或收起节点。 */
	expandOnClickNode: false,
});

// ElMessageBox 默认配置
const elMessageBox = (
	type: "alert" | "confirm" | "prompt",
	message: ElMessageBoxOptions["message"],
	options?: ElMessageBoxOptions,
	appContext?: AppContext | null
): Promise<MessageBoxData> => {
	// 不直接修改调用方传入的配置，避免复用同一个 Options 对象时残留本次默认值和 beforeClose 包装。
	const resolvedOptions: ElMessageBoxOptions = { ...(options ?? {}) };
	// 默认提示
	resolvedOptions.title ??= "温馨提示";
	// 默认拖拽
	resolvedOptions.draggable ??= true;
	// 默认 取消按钮的文本内容
	resolvedOptions.cancelButtonText ??= "取消";
	// 默认 确定按钮的文本内容
	resolvedOptions.confirmButtonText ??= "确定";
	// 默认 是否可通过点击遮罩层关闭 MessageBox
	resolvedOptions.closeOnClickModal ??= false;
	// 默认 是否可通过按下 ESC 键关闭 MessageBox
	resolvedOptions.closeOnPressEscape ??= false;

	// 关闭之前的判断逻辑
	if (resolvedOptions.beforeClose != null) {
		const localBeforeClose = resolvedOptions.beforeClose;
		const localConfirmButtonText = resolvedOptions.confirmButtonText;
		const localShowCancelButton = resolvedOptions.showCancelButton;
		resolvedOptions.beforeClose = (action: Action, instance: MessageBoxState, done: () => void): void => {
			if (action === "confirm") {
				useOverlay.show(0);
				instance.confirmButtonLoading = true;
				instance.showCancelButton = false;
				instance.confirmButtonText = "加载中...";
				let completed = false;

				const cancelLoading = (): void => {
					instance.confirmButtonLoading = false;
					instance.showCancelButton = localShowCancelButton ?? false;
					instance.confirmButtonText = localConfirmButtonText;
					useOverlay.hide();
				};

				const newDone = (): void => {
					if (completed) return;
					completed = true;
					cancelLoading();
					done();
				};

				callOptionalFunction(localBeforeClose, action, instance, newDone)
					.then(() => newDone())
					.catch((error: unknown) => {
						if (!completed) cancelLoading();
						throw error;
					});
			} else {
				done();
			}
		};
	}

	// 根据类型有一些判断
	switch (type) {
		case "alert":
			break;
		case "confirm":
			resolvedOptions.showCancelButton ??= true;
			break;
		case "prompt":
			resolvedOptions.showCancelButton ??= true;
			break;
	}

	return ElMessageBox({ message, ...resolvedOptions, boxType: type }, appContext);
};

type MESSAGE_BOX_TYPE = "alert" | "confirm" | "prompt";
const MESSAGE_BOX_DEFAULT_OPTS: Record<MESSAGE_BOX_TYPE, Partial<ElMessageBoxOptions>> = {
	alert: { closeOnPressEscape: false, closeOnClickModal: false },
	confirm: { showCancelButton: true },
	prompt: { showCancelButton: true, showInput: true },
};

const isAppContext = (value: ElMessageBoxOptions | AppContext | null | undefined): value is AppContext =>
	typeof value === "object" && value !== null && "app" in value && "config" in value;

const createMessageBoxShortcut = (type: MESSAGE_BOX_TYPE): ElMessageBoxShortcutMethod => {
	function shortcut(
		message: ElMessageBoxOptions["message"],
		options?: ElMessageBoxOptions,
		appContext?: AppContext | null
	): Promise<MessageBoxData>;
	function shortcut(
		message: ElMessageBoxOptions["message"],
		title: ElMessageBoxOptions["title"],
		options?: ElMessageBoxOptions,
		appContext?: AppContext | null
	): Promise<MessageBoxData>;
	function shortcut(
		message: ElMessageBoxOptions["message"],
		titleOrOptions?: string | ElMessageBoxOptions,
		optionsOrContext?: ElMessageBoxOptions | AppContext | null,
		appContext?: AppContext | null
	): Promise<MessageBoxData> {
		if (typeof titleOrOptions === "string") {
			const options = isAppContext(optionsOrContext) ? undefined : optionsOrContext;
			return elMessageBox(type, message, { ...MESSAGE_BOX_DEFAULT_OPTS[type], title: titleOrOptions, ...(options ?? {}) }, appContext);
		}

		const context = optionsOrContext === null || isAppContext(optionsOrContext) ? optionsOrContext : undefined;
		return elMessageBox(type, message, { ...MESSAGE_BOX_DEFAULT_OPTS[type], ...(titleOrOptions ?? {}) }, context);
	}

	return shortcut;
};

ElMessageBox.alert = createMessageBoxShortcut("alert");
ElMessageBox.prompt = createMessageBoxShortcut("prompt");
ElMessageBox.confirm = createMessageBoxShortcut("confirm");

/**
 * 注册 Element Plus 及其全部图标。
 *
 * @param app - Vue 应用实例。
 */
export const installElementPlus = (app: App): void => {
	/** 注册 Element Plus 全部图标，供 FaIcon 按名称解析。 */
	for (const [key, component] of Object.entries(ElementPlusIconsVue)) app.component(`el-icon-${key}`, component);

	/** Element Plus 组件完整引入 */
	app.use(ElementPlus);
};
