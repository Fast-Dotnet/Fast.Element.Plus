/**
 * v-copy
 * 点击目标元素，将当前绑定值复制到剪贴板
 * 绑定值为字符串或数字
 * 空字符串、`0` 和 `NaN` 会跳过复制。
 */
import { ElMessage } from "element-plus";
import { copy as copyToClipboard, withInstallDirective } from "../../utils";
import type { Directive, DirectiveBinding } from "vue";

interface CopyElement extends HTMLElement {
	copyData: string | number;
	__handleClick__: () => void;
}

const CopyDirective: Directive = {
	mounted(el: CopyElement, binding: DirectiveBinding<string | number>) {
		el.copyData = binding.value;

		const copy = (): void => {
			if (!el.copyData) return;
			copyToClipboard(String(el.copyData)).then(
				() => {
					ElMessage({
						type: "success",
						message: "复制成功",
					});
				},
				() => {
					ElMessage({
						type: "error",
						message: "复制失败",
					});
				}
			);
		};
		el.__handleClick__ = copy;
		el.addEventListener("click", el.__handleClick__);
	},
	updated(el: CopyElement, binding: DirectiveBinding<string | number>) {
		el.copyData = binding.value;
	},
	beforeUnmount(el: CopyElement) {
		el.removeEventListener("click", el.__handleClick__);
	},
};

/** 将绑定值复制到剪贴板的 Vue 指令。 */
export const vCopy = withInstallDirective(CopyDirective, "copy");
export default vCopy;
