/** 集中维护复制并适配的 Element Plus 运行时 Props；业务组件在此基础上覆写。 */
import { ArrowDown, CircleClose } from "@element-plus/icons-vue";
import { tagProps, useAriaProps, useEmptyValuesProps, useSizeProp, useTooltipContentProps } from "element-plus";
import { definePropType } from "../utils/vue/props";
import type { SelectV2Props as ElementPlusSelectV2Props, Options, Placement, TableColumnCtx, TableProps } from "element-plus";
import type { CSSProperties, Component, PropType } from "vue";
import type { ElSelectorModelValue } from "../components/select/src/select.type";
import type { DefaultRow } from "../components/table/src/table.state";

type Layout = "fixed" | "auto";

/** FaTable 树形数据的字段配置 */
export interface TreeProps {
	hasChildren?: string;
	children?: string;
	checkStrictly?: boolean;
}

/** Element Plus Table 的透传 Props 定义。 */
export const tableProps = {
	/**
	 * table data
	 */
	data: {
		type: Array as PropType<DefaultRow[]>,
		default: (): DefaultRow[] => [],
	},
	/**
	 * size of Table
	 */
	size: useSizeProp,
	width: [String, Number],
	/**
	 * table's height. By default it has an `auto` height. If its value is a number, the height is measured in pixels; if its value is a string, the value will be assigned to element's style.height, the height is affected by external styles
	 */
	height: [String, Number],
	/**
	 * table's max-height. The legal value is a number or the height in px
	 */
	maxHeight: [String, Number],
	/**
	 * whether width of column automatically fits its container
	 */
	fit: {
		type: Boolean,
		default: true,
	},
	/**
	 * whether Table is striped
	 */
	stripe: Boolean,
	/**
	 * whether Table has vertical border
	 */
	border: Boolean,
	/**
	 * key of row data, used for optimizing rendering. Required if `reserve-selection` is on or display tree data. When its type is String, multi-level access is supported, e.g. `user.info.id`, but `user.info[0].id` is not supported, in which case `Function` should be used
	 */
	rowKey: [String, Function] as PropType<TableProps<DefaultRow>["rowKey"]>,
	/**
	 * whether Table header is visible
	 */
	showHeader: {
		type: Boolean,
		default: true,
	},
	/**
	 * whether to display a summary row
	 */
	showSummary: Boolean,
	/**
	 * displayed text for the first column of summary row
	 */
	sumText: String,
	/**
	 * custom summary method
	 */
	summaryMethod: Function as PropType<TableProps<DefaultRow>["summaryMethod"]>,
	/**
	 * function that returns custom class names for a row, or a string assigning class names for every row
	 */
	rowClassName: [String, Function] as PropType<TableProps<DefaultRow>["rowClassName"]>,
	/**
	 * function that returns custom style for a row, or an object assigning custom style for every row
	 */
	rowStyle: [Object, Function] as PropType<TableProps<DefaultRow>["rowStyle"]>,
	/**
	 * function that returns custom class names for a cell, or a string assigning class names for every cell
	 */
	cellClassName: [String, Function] as PropType<TableProps<DefaultRow>["cellClassName"]>,
	/**
	 * function that returns custom style for a cell, or an object assigning custom style for every cell
	 */
	cellStyle: [Object, Function] as PropType<TableProps<DefaultRow>["cellStyle"]>,
	/**
	 * function that returns custom class names for a row in table header, or a string assigning class names for every row in table header
	 */
	headerRowClassName: [String, Function] as PropType<TableProps<DefaultRow>["headerRowClassName"]>,
	/**
	 * function that returns custom style for a row in table header, or an object assigning custom style for every row in table header
	 */
	headerRowStyle: [Object, Function] as PropType<TableProps<DefaultRow>["headerRowStyle"]>,
	/**
	 * function that returns custom class names for a cell in table header, or a string assigning class names for every cell in table header
	 */
	headerCellClassName: [String, Function] as PropType<TableProps<DefaultRow>["headerCellClassName"]>,
	/**
	 * function that returns custom style for a cell in table header, or an object assigning custom style for every cell in table header
	 */
	headerCellStyle: [Object, Function] as PropType<TableProps<DefaultRow>["headerCellStyle"]>,
	/**
	 * whether current row is highlighted
	 */
	highlightCurrentRow: Boolean,
	/**
	 * key of current row, a set only prop
	 */
	currentRowKey: [String, Number],
	/**
	 * displayed text when data is empty. You can customize this area with `#empty`
	 */
	emptyText: String,
	/**
	 * set expanded rows by this prop, prop's value is the keys of expand rows, you should set row-key before using this prop
	 */
	expandRowKeys: Array as PropType<TableProps<DefaultRow>["expandRowKeys"]>,
	/** controls whether a row can be expanded */
	rowExpandable: Function as PropType<TableProps<DefaultRow>["rowExpandable"]>,
	/**
	 * whether expand all rows by default, works when the table has a column type="expand" or contains tree structure data
	 */
	defaultExpandAll: Boolean,
	/**
	 * set the default sort column and order. property `prop` is used to set default sort column, property `order` is used to set default sort order
	 */
	defaultSort: Object as PropType<TableProps<DefaultRow>["defaultSort"]>,
	/**
	 * the `effect` of the overflow tooltip
	 */
	tooltipEffect: String,
	/**
	 * the options for the overflow tooltip, [see the following tooltip component](tooltip.html#attributes)
	 */
	tooltipOptions: Object as PropType<TableProps<DefaultRow>["tooltipOptions"]>,
	/**
	 * method that returns rowspan and colspan
	 */
	spanMethod: Function as PropType<TableProps<DefaultRow>["spanMethod"]>,
	/**
	 * controls the behavior of master checkbox in multi-select tables when only some rows are selected (but not all). If true, all rows will be selected, else deselected
	 */
	selectOnIndeterminate: {
		type: Boolean,
		default: true,
	},
	/**
	 * horizontal indentation of tree data
	 */
	indent: {
		type: Number,
		default: 16,
	},
	/**
	 * configuration for rendering nested data
	 */
	treeProps: {
		type: Object as PropType<TreeProps>,
		default: (): { hasChildren: string; children: string; checkStrictly: boolean } => ({
			hasChildren: "hasChildren",
			children: "children",
			checkStrictly: false,
		}),
	},
	/**
	 * whether to lazy loading data
	 */
	lazy: Boolean,
	/**
	 * method for loading child row data, only works when `lazy` is true
	 */
	load: Function as PropType<TableProps<DefaultRow>["load"]>,
	style: {
		type: Object as PropType<CSSProperties>,
		default: (): CSSProperties => ({}),
	},
	className: {
		type: String,
		default: "",
	},
	/**
	 * sets the algorithm used to lay out table cells, rows, and columns
	 */
	tableLayout: {
		type: String as PropType<Layout>,
		default: "fixed",
	},
	/**
	 * always show scrollbar
	 */
	scrollbarAlwaysOn: Boolean,
	/**
	 * ensure main axis minimum-size doesn't follow the content
	 */
	flexible: Boolean,
	/**
	 * whether to hide extra content and show them in a tooltip when hovering on the cell.It will affect all the table columns
	 */
	showOverflowTooltip: [Boolean, Object] as PropType<TableProps<DefaultRow>["showOverflowTooltip"]>,
	/** formats overflow tooltip content */
	tooltipFormatter: Function as PropType<TableProps<DefaultRow>["tooltipFormatter"]>,
	/** element to which the filter panel is appended */
	appendFilterPanelTo: String,
	scrollbarTabindex: {
		type: [Number, String],
		default: undefined,
	},
	/** whether the last column can be resized */
	allowDragLastColumn: {
		type: Boolean,
		default: true,
	},
	/** whether collapsed expanded-row content remains mounted */
	preserveExpandedContent: Boolean,
	/** whether to use native scrollbars */
	nativeScrollbar: Boolean,
};

/** Element Plus TableColumn 的透传 Props 定义 */
export const tableColumnProps = {
	/**
	 * type of the column. If set to `selection`, the column will display checkbox. If set to `index`, the column will display index of the row (staring from 1). If set to `expand`, the column will display expand icon
	 */
	type: {
		type: String,
		default: "default",
	},
	/**
	 * column label
	 */
	label: String,
	/**
	 * class name of cells in the column
	 */
	className: String,
	/**
	 * class name of the label of this column
	 */
	labelClassName: String,
	/**
	 *
	 */
	property: String,
	/**
	 * field name. You can also use its alias: `property`
	 */
	prop: String,
	/**
	 * column width
	 */
	width: {
		type: [String, Number],
		default: "",
	},
	/**
	 * column minimum width. Columns with `width` has a fixed width, while columns with `min-width` has a width that is distributed in proportion
	 */
	minWidth: {
		type: [String, Number],
		default: "",
	},
	/**
	 * render function for table header of this column
	 */
	renderHeader: Function as PropType<TableColumnCtx<DefaultRow>["renderHeader"]>,
	/**
	 * whether column can be sorted. Remote sorting can be done by setting this attribute to 'custom' and listening to the `sort-change` event of Table
	 */
	sortable: {
		type: [Boolean, String],
		default: false,
	},
	/**
	 * sorting method, works when `sortable` is `true`. Should return a number, just like Array.sort
	 */
	sortMethod: Function as PropType<TableColumnCtx<DefaultRow>["sortMethod"]>,
	/**
	 * specify which property to sort by, works when `sortable` is `true` and `sort-method` is `undefined`. If set to an Array, the column will sequentially sort by the next property if the previous one is equal
	 */
	sortBy: [String, Function, Array] as PropType<TableColumnCtx<DefaultRow>["sortBy"]>,
	/**
	 * whether column width can be resized, works when `border` of `el-table` is `true`
	 */
	resizable: {
		type: Boolean,
		default: true,
	},
	/**
	 * column's key. If you need to use the filter-change event, you need this attribute to identify which column is being filtered
	 */
	columnKey: String,
	/**
	 * alignment, the value should be 'left' \/ 'center' \/ 'right'
	 */
	align: String,
	/**
	 * alignment of the table header. If omitted, the value of the above `align` attribute will be applied, the value should be 'left' \/ 'center' \/ 'right'
	 */
	headerAlign: String,
	/**
	 * whether to hide extra content and show them in a tooltip when hovering on the cell
	 */
	showOverflowTooltip: {
		type: [Boolean, Object] as PropType<TableColumnCtx<DefaultRow>["showOverflowTooltip"]>,
		default: undefined,
	},
	/** function that formats cell tooltip content, works when show-overflow-tooltip is enabled */
	tooltipFormatter: Function as PropType<TableColumnCtx<DefaultRow>["tooltipFormatter"]>,
	/**
	 * whether column is fixed at left / right. Will be fixed at left if `true`
	 */
	fixed: [Boolean, String],
	/**
	 * function that formats cell content
	 */
	formatter: Function as PropType<TableColumnCtx<DefaultRow>["formatter"]>,
	/**
	 * function that determines if a certain row can be selected, works when `type` is 'selection'
	 */
	selectable: Function as PropType<TableColumnCtx<DefaultRow>["selectable"]>,
	/**
	 * whether to reserve selection after data refreshing, works when `type` is 'selection'. Note that `row-key` is required for this to work
	 */
	reserveSelection: Boolean,
	/**
	 * data filtering method. If `filter-multiple` is on, this method will be called multiple times for each row, and a row will display if one of the calls returns `true`
	 */
	filterMethod: Function as PropType<TableColumnCtx<DefaultRow>["filterMethod"]>,
	/**
	 * filter value for selected data, might be useful when table header is rendered with `render-header`
	 */
	filteredValue: Array as PropType<TableColumnCtx<DefaultRow>["filteredValue"]>,
	/**
	 * an array of data filtering options. For each element in this array, `text` and `value` are required
	 */
	filters: Array as PropType<TableColumnCtx<DefaultRow>["filters"]>,
	/**
	 * placement for the filter dropdown
	 */
	filterPlacement: String,
	/**
	 * whether data filtering supports multiple options
	 */
	filterMultiple: {
		type: Boolean,
		default: true,
	},
	/**
	 * className for the filter dropdown
	 */
	filterClassName: String,
	/**
	 * customize indices for each row, works on columns with `type=index`
	 */
	index: [Number, Function] as PropType<TableColumnCtx<DefaultRow>["index"]>,
	/**
	 * the order of the sorting strategies used when sorting the data, works when `sortable` is `true`. Accepts an array, as the user clicks on the header, the column is sorted in order of the elements in the array
	 */
	sortOrders: {
		type: Array as PropType<TableColumnCtx<DefaultRow>["sortOrders"]>,
		default: (): (string | null)[] => {
			return ["ascending", "descending", null];
		},
		validator: (val: unknown): boolean => {
			return Array.isArray(val) && val.every((order: unknown): boolean => order === "ascending" || order === "descending" || order === null);
		},
	},
};

/** 传递给底层 Element Plus 虚拟化选择器的扩展 Props。 */
export interface Props {
	label?: string;
	value?: string;
	disabled?: string;
	options?: string;
}

/** Element Plus SelectV2 的透传 Props 定义。 */
export const SelectV2Props = {
	/**
	 * whether creating new items is allowed. To use this, `filterable` must be true
	 */
	allowCreate: Boolean,
	/**
	 * autocomplete of select input
	 */
	autocomplete: {
		type: definePropType<"none" | "both" | "list" | "inline">(String),
		default: "none",
	},
	/**
	 * for non-filterable Select, this prop decides if the option menu pops up when the input is focused
	 */
	automaticDropdown: Boolean,
	/**
	 * whether select can be cleared
	 */
	clearable: Boolean,
	/**
	 * custom clear icon
	 */
	clearIcon: {
		type: definePropType<string | Component>([String, Object, Function]),
		default: CircleClose,
	},
	/**
	 * tooltip theme, built-in theme: `dark` / `light`
	 */
	effect: {
		type: definePropType<string>(String),
		default: "light",
	},
	/**
	 * whether to collapse tags to a text when multiple selecting
	 */
	collapseTags: Boolean,
	/**
	 * whether show all selected tags when mouse hover text of collapse-tags. To use this, `collapse-tags` must be true
	 */
	collapseTagsTooltip: Boolean,
	/** collapse-tags tooltip configuration */
	tagTooltip: {
		type: definePropType<ElementPlusSelectV2Props["tagTooltip"]>(Object),
		default: (): NonNullable<ElementPlusSelectV2Props["tagTooltip"]> => ({}),
	},
	/**
	 * The max tags number to be shown. To use this, `collapse-tags` must be true
	 */
	maxCollapseTags: {
		type: Number,
		default: 1,
	},
	/**
	 *
	 */
	defaultFirstOption: Boolean,
	/**
	 * is disabled
	 */
	disabled: Boolean,
	/**
	 *
	 */
	estimatedOptionHeight: {
		type: Number,
		default: undefined,
	},
	/**
	 * is filterable
	 */
	filterable: Boolean,
	/**
	 *
	 */
	filterMethod: Function as PropType<ElementPlusSelectV2Props["filterMethod"]>,
	/**
	 * The height of the dropdown panel, 34px for each item
	 */
	height: {
		type: Number,
		default: 274, // same as select dropdown menu
	},
	/**
	 * The height of the dropdown item
	 */
	itemHeight: {
		type: Number,
		default: 34,
	},
	/**
	 *
	 */
	id: String,
	/**
	 * whether Select is loading data from server
	 */
	loading: Boolean,
	/**
	 * displayed text while loading data from server, default is 'Loading'
	 */
	loadingText: String,
	/**
	 * biding value
	 */
	modelValue: {
		type: definePropType<ElSelectorModelValue>([Array, String, Number, Boolean, Object]),
	},
	/**
	 * is multiple
	 */
	multiple: Boolean,
	/**
	 * maximum number of options user can select when multiple is true. No limit when set to 0
	 */
	multipleLimit: {
		type: Number,
		default: 0,
	},
	/**
	 * the name attribute of select input
	 */
	name: String,
	/**
	 * displayed text when there is no options, you can also use slot empty, the default is 'No Data'
	 */
	noDataText: String,
	/**
	 * displayed text when no data matches the filtering query, you can also use slot `empty`, default is 'No matching data'
	 */
	noMatchText: String,
	/**
	 * function that gets called when the input value changes. Its parameter is the current input value. To use this, `filterable` must be true
	 */
	remoteMethod: Function as PropType<ElementPlusSelectV2Props["remoteMethod"]>,
	/**
	 * whether reserve the keyword after select filtered option.
	 */
	reserveKeyword: {
		type: Boolean,
		default: true,
	},
	/**
	 * data of the options, the key of `value` and `label` can be customize by `props`
	 */
	options: {
		type: definePropType<ElementPlusSelectV2Props["options"]>(Array),
	},
	/**
	 * placeholder, the default is 'Please select'
	 */
	placeholder: {
		type: String,
	},
	/**
	 * whether select dropdown is teleported to the body
	 */
	// eslint-disable-next-line @typescript-eslint/no-deprecated -- 复用 Element Plus 2.x 的运行时默认值与校验规则。
	teleported: useTooltipContentProps.teleported,
	/**
	 * when select dropdown is inactive and `persistent` is `false`, select dropdown will be destroyed
	 */
	persistent: {
		type: Boolean,
		default: true,
	},
	/**
	 * custom class name for Select's dropdown
	 */
	popperClass: {
		type: String,
		default: "",
	},
	/** custom style for Select's dropdown */
	// eslint-disable-next-line @typescript-eslint/no-deprecated -- 复用 Element Plus 2.x 的运行时类型定义。
	popperStyle: useTooltipContentProps.popperStyle,
	/**
	 * [popper.js](https://popper.js.org/docs/v2/) parameters
	 */
	popperOptions: {
		type: definePropType<Partial<Options>>(Object),
		default: (): Partial<Options> => ({}),
	},
	/**
	 * whether search data from server
	 */
	remote: Boolean,
	/** debounce delay during remote search, in milliseconds */
	debounce: {
		type: Number,
		default: 300,
	},
	/**
	 * size of component
	 */
	size: useSizeProp,
	/**
	 * configuration options, see the following table
	 */
	props: {
		type: definePropType<Props>(Object),
		default: (): { label: string; value: string; disabled: string; options: string } => ({
			label: "label",
			value: "value",
			disabled: "disabled",
			options: "options",
		}),
	},
	/**
	 * unique identity key name for value, required when value is an object
	 */
	valueKey: {
		type: String,
		default: "value",
	},
	/**
	 * Controls whether the scrollbar is always displayed
	 */
	scrollbarAlwaysOn: Boolean,
	/**
	 * whether to trigger form validation
	 */
	validateEvent: {
		type: Boolean,
		default: true,
	},
	/**
	 * offset of the dropdown
	 */
	offset: {
		type: Number,
		default: 12,
	},
	/** whether to show the suffix icon during remote search */
	remoteShowSuffix: Boolean,
	/**
	 * Determines whether the arrow is displayed
	 */
	showArrow: {
		type: Boolean,
		default: true,
	},
	/**
	 * position of dropdown
	 */
	placement: {
		type: definePropType<Placement>(String),
		default: "bottom-start",
	},
	/**
	 * list of possible positions for dropdown
	 */
	fallbackPlacements: {
		type: definePropType<Placement[]>(Array),
		default: ["bottom-start", "top-start", "right", "left"],
	},
	/**
	 * tag type
	 */
	// eslint-disable-next-line @typescript-eslint/no-deprecated -- 复用 Element Plus 2.x 的 Tag 运行时校验规则。
	tagType: { ...tagProps.type, default: "info" },
	/**
	 * tag effect
	 */
	// eslint-disable-next-line @typescript-eslint/no-deprecated -- 复用 Element Plus 2.x 的 Tag 运行时校验规则。
	tagEffect: { ...tagProps.effect, default: "light" },
	/**
	 * tabindex for input
	 */
	tabindex: {
		type: [String, Number],
		default: 0,
	},
	/**
	 * which element the select dropdown appends to
	 */
	appendTo: String,
	/** whether the dropdown width follows the input width, or a fixed width */
	fitInputWidth: {
		type: [Boolean, Number],
		default: true,
		validator: (value: boolean | number): boolean => typeof value === "boolean" || typeof value === "number",
	},
	/** select suffix icon */
	suffixIcon: {
		type: definePropType<string | Component>([String, Object, Function]),
		default: ArrowDown,
	},
	// eslint-disable-next-line @typescript-eslint/no-deprecated -- 复用 Element Plus 2.x 的空值运行时约定。
	...useEmptyValuesProps,
	...useAriaProps(["ariaLabel"]),
};
