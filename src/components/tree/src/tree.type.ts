/** 树组件支持的节点值类型 */
export type ElTreeValue = string | number | boolean | object | null;

/** 树组件标准化后的节点数据 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 树节点原始数据由业务接口定义。
export interface ElTreeOutput<T = ElTreeValue, Data = any> {
	/**
	 * 显示
	 */
	label?: string;
	/**
	 * 值
	 */
	value?: T;
	/**
	 * 附加数据
	 */
	data?: Data;
	/**
	 * 是否隐藏
	 */
	hide?: boolean;
	/**
	 * 是否禁用
	 */
	disabled?: boolean;
	/**
	 * 子节点
	 */
	children?: ElTreeOutput<T, Data>[];
	/**
	 * 是否显示数量
	 */
	showQuantity?: boolean;
	/**
	 * 数量
	 */
	quantity?: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 树节点允许携带业务接口返回的附加字段。
	[key: string]: any;
}
