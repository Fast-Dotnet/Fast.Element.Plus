import type { TableColumnCtx } from "element-plus";
import type { VNode } from "vue";
import type { FaLayoutGridBreakpoint, FaLayoutGridItemResponsive } from "../../layoutGrid";
import type { PagedInput } from "./page.type";
import type { DefaultRow, FaTableState } from "./table.state";

/** FaTable 默认插槽共享的状态与操作。 */
export interface FaTableDefaultSlotsResult {
	loading: boolean;
	searchParam: PagedInput;
	selected: boolean;
	selectedList: DefaultRow[];
	selectedListIds: (string | number)[];
	indeterminateSelectedListIds: (string | number)[];
	/** 可能为空 */
	search?: () => Promise<void>;
}

/**
 * 获取 FaTable 默认插槽共享数据。
 * @param state - FaTable 内部状态。
 * @returns 可传给业务插槽的选择、搜索和加载状态。
 */
export const getTableDefaultSlots = (state: FaTableState): FaTableDefaultSlotsResult => {
	return {
		loading: state.loading,
		searchParam: state.searchParam,
		selected: state.selected,
		selectedList: state.selectedList,
		selectedListIds: state.selectedListIds,
		indeterminateSelectedListIds: state.indeterminateSelectedListIds,
	};
};

/** FaTable 默认时间搜索支持的快捷日期范围 */
export type FaTableDataRange = "Past1D" | "Past3D" | "Past1W" | "Past1M" | "Past3M" | "Past6M" | "Past1Y" | "Past3Y";

/** FaTable 枚举列的选项配置 */
export interface FaTableEnumColumnCtx {
	/**
	 * 选项框显示的文字
	 */
	label: string;
	/**
	 * 选项框值
	 */
	value: string | number | boolean;
	/**
	 * 显示
	 */
	show?: boolean;
	/**
	 * 是否禁用此选项
	 */
	disabled?: boolean;
	/**
	 * 为树形选择是，可以通过 children 属性指定子选项
	 */
	children?: FaTableEnumColumnCtx[];
	/**
	 * 提示
	 */
	tips?: string;
	/**
	 * Tag的类型，默认 "primary"
	 */
	type?: "primary" | "success" | "info" | "warning" | "danger";
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 枚举项允许携带业务接口定义的附加字段。
	[key: string]: any;
}

/** FaTable 枚举列接受的字典名称、选项集合或选项工厂。 */
export type FaTableEnumColumnType = string | FaTableEnumColumnCtx[] | ((context?: { row: DefaultRow }) => FaTableEnumColumnCtx[]);

/** FaTable 搜索项支持的内置组件名或自定义组件名 */
export type FaTableSearchColumnEl =
	| ""
	| "el-input"
	| "el-input-number"
	| "el-select"
	| "el-select-v2"
	| "el-tree-select"
	| "el-cascader"
	| "el-date-picker"
	| "el-time-picker"
	| "el-time-select"
	| "el-switch"
	| "el-slider"
	| "slot"
	| (string & Record<never, never>);

/** FaTable 单列搜索项的组件、布局和默认值配置 */
export type FaTableSearchColumnCtx = Partial<Record<FaLayoutGridBreakpoint, FaLayoutGridItemResponsive>> & {
	/**
	 * 当前项搜索框的类型
	 */
	el: FaTableSearchColumnEl;
	/**
	 * 搜索项参数，根据 element plus 官方文档来传递，该属性所有值会透传到组件
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 搜索组件透传属性由具体组件和业务配置共同定义。
	props?: Record<string, any>;
	/**
	 * 当搜索项 label 不为列 label 属性时，可通过 label 指定
	 */
	label?: string;
	/**
	 * 当搜索项 key 不为 prop 属性时，可通过 key 指定
	 */
	key?: string;
	/**
	 * 搜索项排序（从大到小）
	 */
	order?: number;
	/**
	 * 搜索项所占用的列数，默认为1列
	 */
	span?: number;
	/**
	 * 搜索字段左侧偏移列数
	 */
	offset?: number;
	/**
	 * 插槽名称
	 */
	slot?: string;
	/**
	 * 搜索项默认值
	 */
	defaultValue?: unknown;
};

/**
 * FaTable 内置业务列类型
 * @property default     默认
 * @property selection	 选择列
 * @property expand      可展开按钮列
 * @property expand      可展开按钮列
 * @property image       图片列
 * @property date        日期显示（格式 "YYYY-MM-DD"）
 * @property time        时间显示（格式 "HH:mm:ss"）
 * @property dateTime    日期时间显示（格式 "YYYY-MM-DD HH:mm:ss"）
 * @property d2          数值列，保留 2 位小数，不带千分位
 * @property d4          数值列，保留 4 位小数，不带千分位
 * @property d6          数值列，保留 6 位小数，不带千分位
 * @property gd2         数值列，保留 2 位小数，带千分位
 * @property gd4         数值列，保留 4 位小数，带千分位
 * @property gd6         数值列，保留 6 位小数，带千分位
 * @property timeInfo  时间信息列
 */
export type FaTableColumnType =
	"default" | "selection" | "index" | "expand" | "image" | "date" | "time" | "dateTime" | "d2" | "d4" | "d6" | "gd2" | "gd4" | "gd6" | "timeInfo";

/** FaTable 日期、时间列支持的格式化模板。 */
export type FaTableColumnDateFormat =
	| "YYYY-MM-DD HH:mm:ss"
	| "YYYY-MM-DD HH:mm"
	| "YYYY-MM-DD"
	| "YYYY-MM"
	| "YYYY"
	| "MM"
	| "DD"
	| "MM-DD"
	| "HH:mm:ss"
	| "HH:mm"
	| "HH"
	| "mm:ss"
	| "mm"
	| "ss";

/** FaTable 列配置，扩展 Element Plus 列能力和 Fast 业务渲染选项。 */
export type FaTableColumnCtx<T extends DefaultRow = DefaultRow> = Partial<
	Omit<TableColumnCtx<T>, "order" | "type" | "prop" | "sortable" | "_children">
> & {
	/**
	 * 内部的计算属性，一般不做使用
	 */
	multiOrder?: "" | "ascending" | "descending";
	/**
	 * 列Id
	 */
	columnId?: number | string;
	/**
	 * 排序
	 */
	order?: number;
	/**
	 * 排序字段
	 */
	sortableField?: string;
	/**
	 * 禁用排序配置
	 */
	disabledSortable?: boolean;
	/**
	 * 合并行字段
	 */
	spanProp?: string;
	/**
	 * 纯搜索
	 */
	pureSearch?: boolean;
	/**
	 * 搜索项配置
	 */
	search?: FaTableSearchColumnCtx;
	/** 上面所有属性，全部非 FaTableColumn props，均为计算属性 */
	/**
	 * 对应列的类型
	 */
	type?: FaTableColumnType;
	/**
	 * 字段名称
	 */
	prop?: string;
	/**
	 * 是否显示在表格当中，默认 true
	 */
	show?: boolean;
	/**
	 * 对应列是否可以排序，
	 * 默认为 'custom' 模式，即远程排序，
	 * 需要监听 Table 的 sort-change 事件
	 */
	sortable?: boolean;
	/**
	 * 小页面的宽度，如果为空，则继承默认宽度
	 */
	smallWidth?: string | number;
	/**
	 * 自适应宽度
	 */
	autoWidth?: boolean;
	/**
	 * 插槽名称
	 */
	slot?: string;
	/**
	 * 表格头部插槽名称
	 */
	headerSlot?: string;
	/**
	 * 自定义表头内容渲染（tsx语法）
	 */
	headerRender?: ({ column, $index }: { column: TableColumnCtx<DefaultRow>; $index: number } & FaTableDefaultSlotsResult) => VNode[];
	/**
	 * 自定义单元格内容渲染（tsx语法）
	 */
	render?: ({ row, column, $index }: { row: DefaultRow; column: FaTableColumnCtx; $index: number } & FaTableDefaultSlotsResult) => VNode[];
	/**
	 * 多级表头
	 */
	_children?: FaTableColumnCtx<T>[];
	/**
	 * 复制
	 */
	copy?: boolean;
	/**
	 * 是否为 Link Button
	 */
	link?: boolean;
	/**
	 * 点击事件，优先级最高
	 */
	click?: ({ row, $index }: { row: T; $index?: number } & FaTableDefaultSlotsResult) => void;
	/**
	 * 点击Emits事件回调
	 */
	clickEmit?: string;
	/**
	 * 图片列是否显示为原图，默认 false 显示缩略图
	 */
	originalImage?: boolean;
	/**
	 * 显示时间格式化字符串，默认 false
	 */
	dateFix?: boolean;
	/**
	 * 显示在页面中的日期格式
	 */
	dateFormat?: FaTableColumnDateFormat;
	/**
	 * 是否是标签展示，默认 false
	 */
	tag?: boolean;
	/**
	 * 枚举类型（渲染值的字典）
	 */
	enum?: FaTableEnumColumnType;
	/**
	 * 数据删除字段，如果为 true 会显示遮罩层
	 */
	dataDeleteField?: string;
	/**
	 * 时间信息字段
	 */
	timeInfoField?: { userName?: string; time?: string };
};
