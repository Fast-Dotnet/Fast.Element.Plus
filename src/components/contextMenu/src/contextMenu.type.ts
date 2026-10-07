/** FaContextMenu 菜单项配置 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 菜单项默认携带的数据由调用方定义，也可通过泛型显式约束。
export interface FaContextMenuData<Data = any> {
	/**
	 * 名称
	 */
	name: string;
	/**
	 * 标签
	 */
	label: string;
	/**
	 * 图标
	 */
	icon?: string;
	/**
	 * 隐藏
	 */
	hide?: boolean;
	/**
	 * 禁用
	 */
	disabled?: boolean;
	/**
	 * 点击事件
	 */
	click?: (event: MouseEvent, data: FaContextMenuData<Data>) => Promise<void> | void;
	/**
	 * 携带数据
	 */
	data?: Data;
}
