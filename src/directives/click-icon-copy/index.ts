/**
 * v-iconCopy
 * 左侧插入复制图标，复制某个值至剪贴板
 * 绑定值为字符串、数字、`null` 或 `undefined`
 * 图标随绑定值变化而显示或隐藏，点击时复制当前值。
 */
import { h, render } from "vue";
import { CopyDocument } from "@element-plus/icons-vue";
import { ElIcon, ElMessage } from "element-plus";
import { copy as copyToClipboard, withInstallDirective } from "../../utils";
import type { Directive, DirectiveBinding } from "vue";

type CopyValue = string | number | null | undefined;

const copyIcons = new WeakMap<HTMLElement, { container: HTMLDivElement; value: string | number }>();

const removeIcon = (el: HTMLElement): void => {
	const icon = copyIcons.get(el);
	if (!icon) return;

	// 图标 DOM 已移到目标元素旁，Vue 仍通过原容器卸载图标。
	render(null, icon.container);
	copyIcons.delete(el);
};

const syncIcon = (el: HTMLElement, { value }: DirectiveBinding<CopyValue>): void => {
	if (value == null || value === "") {
		removeIcon(el);
		return;
	}

	const existingIcon = copyIcons.get(el);
	if (existingIcon) {
		existingIcon.value = value;
		return;
	}

	const parent = el.parentElement;
	if (!parent) return;

	const icon = { container: document.createElement("div"), value };
	const handleCopyClick = (): void => {
		copyToClipboard(String(icon.value)).then(
			() => {
				ElMessage({ type: "success", message: "复制成功" });
			},
			() => {
				ElMessage({ type: "error", message: "复制失败" });
			}
		);
	};

	render(h(ElIcon, { class: "fa__copy-icon", title: "复制", onClick: handleCopyClick }, { default: () => h(CopyDocument) }), icon.container);
	const iconElement = icon.container.firstChild;
	if (iconElement === null) return;

	parent.insertBefore(iconElement, el);
	copyIcons.set(el, icon);
};

const IconCopyDirective: Directive<HTMLElement, CopyValue> = {
	mounted: syncIcon,
	updated: syncIcon,
	beforeUnmount: removeIcon,
};

/** 在目标元素前显示复制图标。绑定值为 null、undefined 或空字符串时移除图标。 */
export const vIconCopy = withInstallDirective(IconCopyDirective, "iconCopy");
export default vIconCopy;
