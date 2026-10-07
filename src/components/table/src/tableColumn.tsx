import { Fragment, computed, defineComponent, h, inject, resolveComponent } from "vue";
import { CopyDocument } from "@element-plus/icons-vue";
import { ElIcon, ElImage, ElMessage, ElTableColumn, ElTag, ElText, dayjs, useGlobalSize } from "element-plus";
import { tableColumnProps } from "../../../internal/props";
import { copy as copyToClipboard, definePropType, formatChineseRelativeTime, makeSlots, useProps, useRender } from "../../../utils";
import FaImage from "../../image";
import artwork from "../images/artwork.png";
import notImage from "../images/notImage.png";
import { tableUtil } from "../utils/table";
import { getTableDefaultSlots } from "./table.type";
import { enumMapKey, tableStateKey } from "./useTable";
import type { TableColumnCtx } from "element-plus";
import type { VNode } from "vue";
import type { DefaultRow } from "./table.state";
import type {
	FaTableColumnCtx,
	FaTableColumnDateFormat,
	FaTableColumnType,
	FaTableDefaultSlotsResult,
	FaTableEnumColumnCtx,
	FaTableEnumColumnType,
} from "./table.type";

export { tableColumnProps } from "../../../internal/props";

/** FaTableColumn 插槽返回的行列上下文 */
export interface FaTableColumnSlotsResult {
	/** slots为表格内容的时候才会返回 */
	row?: DefaultRow;
	/** slot为表头内容的时候返回 'TableColumnCtx<DefaultRow>' 否则返回 'FaTableColumnCtx' */
	column?: TableColumnCtx<DefaultRow> | FaTableColumnCtx;
	$index?: number;
}

type FaTableColumnDefaultSlots = Record<string, FaTableDefaultSlotsResult & FaTableColumnSlotsResult>;

/** FaTableColumn 的固定插槽和动态命名插槽。 */
export type FaTableColumnSlots = Record<string, unknown> & {
	/** 默认内容插槽 */
	default: FaTableDefaultSlotsResult & { row: DefaultRow; column: FaTableColumnCtx; $index: number };
	/** 自定义表头的内容 */
	header: FaTableDefaultSlotsResult & { column: FaTableColumnCtx; $index: number };
	/** 自定义 filter 图标 */
	filterIcon: FaTableDefaultSlotsResult & { filterOpened: boolean };
	/** 展开列的自定义内容 */
	expand: FaTableDefaultSlotsResult & { expanded: boolean };
} & FaTableColumnDefaultSlots;

export default defineComponent({
	name: "FaTableColumn",
	props: {
		...tableColumnProps,
		/**
		 * type of the column. If set to `selection`, the column will display checkbox. If set to `index`, the column will display index of the row (staring from 1). If set to `expand`, the column will display expand icon
		 */
		type: {
			type: definePropType<FaTableColumnType>(String),
			default: "default",
		},
		/**
		 * column width
		 */
		width: {
			type: [String, Number],
			default: "auto",
		},
		/** alignment, the value should be 'left' \/ 'center' \/ 'right' */
		align: {
			type: String,
			default: "left",
		},
		/** alignment of the table header. If omitted, the value of the above `align` attribute will be applied, the value should be 'left' \/ 'center' \/ 'right' */
		headerAlign: {
			type: String,
			default: "left",
		},
		/** 是否显示在表格当中 */
		show: Boolean,
		/** 小页面的宽度，如果为空，则继承默认宽度 */
		smallWidth: {
			type: [String, Number],
		},
		/** 自适应宽度 */
		autoWidth: Boolean,
		/** 插槽名称 */
		slot: String,
		/** 表格头部插槽名称 */
		headerSlot: String,
		/** 自定义表头内容渲染（tsx语法） */
		headerRender: {
			type: definePropType<({ column, $index }: { column: TableColumnCtx<DefaultRow>; $index: number } & FaTableDefaultSlotsResult) => VNode[]>(
				Function
			),
		},
		/** 自定义单元格内容渲染（tsx语法） */
		render: {
			type: definePropType<
				({ row, column, $index }: { row: DefaultRow; column: FaTableColumnCtx; $index: number } & FaTableDefaultSlotsResult) => VNode[]
			>(Function),
		},
		/** 多级表头 */
		_children: {
			type: definePropType<FaTableColumnCtx[]>(Array),
		},
		/** 隐藏图片 */
		hideImage: Boolean,
		/** 复制 */
		copy: Boolean,
		/** 是否为 Link Button */
		link: Boolean,
		/** 合并行字段 */
		spanProp: String,
		/** Link 按钮的点击事件，优先级最高 */
		click: {
			type: definePropType<({ row, $index }: { row: DefaultRow; $index?: number } & FaTableDefaultSlotsResult) => void>(Function),
		},
		/** 点击Emits事件回调 */
		clickEmit: String,
		/** 图片列是否显示为原图，默认 false 显示缩略图 */
		originalImage: Boolean,
		/** 显示时间格式化字符串 */
		dateFix: Boolean,
		/** 显示在页面中的日期格式 */
		dateFormat: {
			type: definePropType<FaTableColumnDateFormat>(String),
		},
		/** 是否是标签展示 */
		tag: Boolean,
		/** 枚举类型（渲染值的字典） */
		enum: {
			type: definePropType<FaTableEnumColumnType>([String, Array, Function]),
		},
		/** 数据删除字段，如果为 true 会显示遮罩层 */
		dataDeleteField: String,
		/** 时间信息字段 */
		timeInfoField: {
			type: definePropType<{ userName?: string; time?: string }>(Object),
			default: () => ({
				userName: "createdUserName",
				time: "createdTime",
			}),
		},
	},
	emits: {
		/** 图片预览 */
		imagePreview: (url: string) => typeof url === "string",
		/** 自定义单元格点击事件 */
		customCellClick: (emitName: string, { row, column, $index }: { row: DefaultRow; column: FaTableColumnCtx; $index: number }) =>
			(emitName == null || typeof emitName === "string") &&
			typeof row === "object" &&
			row !== null &&
			typeof column === "object" &&
			column !== null &&
			typeof $index === "number",
	},
	slots: makeSlots<FaTableColumnSlots>(),
	setup(props, { slots, emit }) {
		const globalSize = useGlobalSize();
		const tableState = inject(tableStateKey);
		const enumMap = inject(enumMapKey);
		if (tableState === undefined || enumMap === undefined) {
			throw new Error("FaTableColumn 必须在 FaTable 内部渲染。");
		}

		const columnCtx = computed(() => props as FaTableColumnCtx);

		/** 获取ClassName */
		const getClassName = () => {
			let className = "";
			if (props.type === "timeInfo") {
				className += "fa-table__line-height-normal-column";
			}
			if (props.type === "date" || props.type === "time" || props.type === "dateTime") {
				if (props.dateFix) {
					className += "fa-table__line-height-normal-column";
				}
			}
			if (props.className) {
				return `${className} ${props.className}`;
			}
			return className;
		};

		/** 获取宽度 */
		const getWidth = (defAttr: string) => {
			if (props.autoWidth) {
				const autoWidthEntry = tableState.autoColumnWidth.find((f) => f.prop === props.prop);
				return autoWidthEntry ? `${autoWidthEntry.width}px` : "auto";
			}
			if (globalSize.value === "small") {
				return props.smallWidth || props.width || props.minWidth || defAttr;
			}
			return props.width || props.minWidth || defAttr;
		};

		/** 表头自动宽度渲染 */
		const autoWidthHeaderRender = (el: VNode[]) => {
			if (props.autoWidth) {
				return [
					<div class={["fa-table__auto-width-column__cell-header", `__fa-table__auto-width-column__cell-header__${props.prop}`]}>{el}</div>,
				];
			} else {
				return el;
			}
		};

		/** 自动宽度渲染 */
		const autoWidthRender = (el: VNode[]) => {
			if (props.autoWidth) {
				return [<div class={["fa-table__auto-width-column__cell", `__fa-table__auto-width-column__cell__${props.prop}`]}>{el}</div>];
			} else {
				return el;
			}
		};

		/** 表头渲染 */
		const headerRender = ({ column, $index }: { column: TableColumnCtx<DefaultRow>; $index: number }) => {
			if (props.headerRender) {
				return autoWidthHeaderRender(props.headerRender({ column, $index, ...getTableDefaultSlots(tableState) }));
			} else if (props.headerSlot) {
				return autoWidthHeaderRender(slots[props.headerSlot]?.({ column, $index, ...getTableDefaultSlots(tableState) }) ?? []);
			} else {
				return autoWidthHeaderRender([<span>{props.label}</span>]);
			}
		};

		/** 复制渲染 */
		const displayText = (value: unknown) => {
			if (typeof value === "string") return value;
			if (typeof value === "number" || typeof value === "bigint" || typeof value === "boolean") return String(value);
			return "";
		};

		const copyRender = (value: unknown, copy?: boolean) => {
			if (!(props.copy || copy) || !value) return [];

			return [
				<ElIcon
					class="fa__copy-icon"
					title="复制"
					onClick={() => {
						copyToClipboard(displayText(value)).then(
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
					}}
				>
					<CopyDocument />
				</ElIcon>,
			];
		};

		/** 渲染单元格数据 */
		const renderCellData = ({ row }: { row: DefaultRow }) => {
			const cellValue = tableUtil.handleRowAccordingToProp(row, props.prop ?? "");

			let enumData: FaTableEnumColumnCtx[] | undefined;

			if (typeof props.enum === "string") {
				enumData = enumMap.get(props.enum);
			} else if (Array.isArray(props.enum)) {
				enumData = props.enum;
			} else if (typeof props.enum === "function") {
				enumData = props.enum({ row });
			}

			if (enumData) {
				return tableUtil.filterEnum(cellValue, enumData);
			} else {
				return tableUtil.formatValue(cellValue);
			}
		};

		/** 格式化渲染 */
		const formatterRender = (row: DefaultRow, column: TableColumnCtx<DefaultRow>, cellValue: unknown, index: number) => {
			const formatter = column.formatter as TableColumnCtx<DefaultRow>["formatter"] | null | undefined;
			if (formatter) {
				return formatter(row, column, cellValue, index);
			} else {
				return displayText(cellValue);
			}
		};

		/** 时间信息列渲染 */
		const timeInfoRender = (row: DefaultRow, _column: TableColumnCtx<DefaultRow>, _$index: number) => {
			const userName = displayText(row[props.timeInfoField.userName ?? "createdUserName"]);
			const time = displayText(row[props.timeInfoField.time ?? "createdTime"]);
			return [
				<Fragment>
					<div style="white-space: nowrap; overflow: hidden; text-overflow:  ellipsis;" title={time}>
						{userName && <span style="margin-right: 5px;">{userName}</span>}
						<span>{time}</span>
					</div>
					{time && (
						<ElTag type="info" round effect="light" size="small">
							{formatChineseRelativeTime(time)}
						</ElTag>
					)}
				</Fragment>,
			];
		};

		/** 标签列渲染 */
		const tagRender = (row: DefaultRow, column: TableColumnCtx<DefaultRow>, $index: number) => {
			const renderValue = formatterRender(row, column, renderCellData({ row }), $index);

			let enumData: FaTableEnumColumnCtx[] | undefined;

			if (typeof props.enum === "string") {
				enumData = enumMap.get(props.enum);
			} else if (Array.isArray(props.enum)) {
				enumData = props.enum;
			} else if (typeof props.enum === "function") {
				enumData = props.enum({ row });
			}

			const enumValue: unknown = tableUtil.handleRowAccordingToProp(row, props.prop ?? "");
			const type = enumData?.find((item) => item.value === enumValue)?.type ?? "info";
			return [
				<Fragment>
					{copyRender(renderValue)}
					{renderValue ? <ElTag type={type}>{renderValue}</ElTag> : null}
				</Fragment>,
			];
		};

		/** 时间列渲染 */
		const dateRender = (row: DefaultRow, column: TableColumnCtx<DefaultRow>, $index: number) => {
			let dateFormat;
			switch (props.type) {
				case "date":
					dateFormat = "YYYY-MM-DD";
					break;
				case "time":
					dateFormat = "HH:mm:ss";
					break;
				case "dateTime":
					dateFormat = "YYYY-MM-DD HH:mm:ss";
					break;
				case "default":
				case "index":
				case "selection":
				case "expand":
				case "image":
				case "d2":
				case "d4":
				case "d6":
				case "gd2":
				case "gd4":
				case "gd6":
				case "timeInfo":
					break;
			}
			const cellValue = tableUtil.handleRowAccordingToProp(row, props.prop ?? "");
			const renderValue = cellValue
				? formatterRender(row, column, dayjs(cellValue as Parameters<typeof dayjs>[0]).format(props.dateFormat ?? dateFormat), $index)
				: null;
			return [
				<Fragment>
					{copyRender(renderValue)}
					{renderValue}
					{props.dateFix && renderValue && (
						<Fragment>
							<br />
							<ElTag type="info" round effect="light" size="small">
								{formatChineseRelativeTime(displayText(renderValue))}
							</ElTag>
						</Fragment>
					)}
				</Fragment>,
			];
		};

		/** 数值列渲染 */
		const numberRender = (row: DefaultRow, column: TableColumnCtx<DefaultRow>, $index: number) => {
			const cellValue = tableUtil.handleRowAccordingToProp(row, props.prop ?? "");
			if (!cellValue || typeof cellValue !== "number") {
				return [<Fragment>{formatterRender(row, column, cellValue, $index)}</Fragment>];
			}
			let useGrouping = false;
			let maximumFractionDigits = 2;
			switch (props.type) {
				case "d2":
					maximumFractionDigits = 2;
					break;
				case "d4":
					maximumFractionDigits = 4;
					break;
				case "d6":
					maximumFractionDigits = 6;
					break;
				case "gd2":
					maximumFractionDigits = 2;
					useGrouping = true;
					break;
				case "gd4":
					maximumFractionDigits = 4;
					useGrouping = true;
					break;
				case "gd6":
					maximumFractionDigits = 6;
					useGrouping = true;
					break;
				case "default":
				case "index":
				case "selection":
				case "expand":
				case "image":
				case "date":
				case "time":
				case "dateTime":
				case "timeInfo":
					break;
			}

			return [
				<Fragment>
					{formatterRender(
						row,
						column,
						cellValue.toLocaleString("zh-CN", {
							minimumFractionDigits: 2,
							maximumFractionDigits,
							useGrouping,
						}),
						$index
					)}
				</Fragment>,
			];
		};

		/** 链接列渲染 */
		const linkRender = (row: DefaultRow, column: TableColumnCtx<DefaultRow>, $index: number) => {
			const cellValue = tableUtil.handleRowAccordingToProp(row, props.prop ?? "");
			const renderValue = formatterRender(row, column, cellValue, $index);
			return autoWidthRender([
				<Fragment>
					{copyRender(renderValue)}
					{renderValue && (
						<ElText
							class={"el-link is-hover-underline fa-table__link-column__text"}
							onClick={() => {
								// 数据删除拦截点击
								if (props.dataDeleteField && row[props.dataDeleteField] === true) return;
								if (props.click) {
									props.click({ row, $index, ...getTableDefaultSlots(tableState) });
								} else {
									emit("customCellClick", props.clickEmit ?? "", {
										row,
										column: columnCtx.value,
										$index,
									});
								}
							}}
						>
							{renderValue}
						</ElText>
					)}
				</Fragment>,
			]);
		};

		const defaultRender = ({ row, column, $index }: { row: DefaultRow; column: TableColumnCtx<DefaultRow>; $index: number }) => {
			if (props.type === "timeInfo") {
				return timeInfoRender(row, column, $index);
			}
			if (props.tag) {
				return tagRender(row, column, $index);
			}
			if (props.type === "date" || props.type === "time" || props.type === "dateTime") {
				return dateRender(row, column, $index);
			}
			if (
				props.type === "d2" ||
				props.type === "d4" ||
				props.type === "d6" ||
				props.type === "gd2" ||
				props.type === "gd4" ||
				props.type === "gd6"
			) {
				return numberRender(row, column, $index);
			}
			if (props.link) {
				return linkRender(row, column, $index);
			}
			if (props.render) {
				return autoWidthRender(props.render({ row, column: columnCtx.value, $index, ...getTableDefaultSlots(tableState) }));
			}
			if (props.slot) {
				return autoWidthRender(slots[props.slot]?.({ row, column: columnCtx.value, $index, ...getTableDefaultSlots(tableState) }) ?? []);
			}
			const cellValue = tableUtil.handleRowAccordingToProp(row, props.prop ?? "");
			const renderValue = formatterRender(row, column, cellValue, $index);
			return autoWidthRender([
				<Fragment>
					{copyRender(renderValue)}
					{renderValue}
				</Fragment>,
			]);
		};

		const elTableColumnProps = useProps(props, tableColumnProps, [
			"type",
			"width",
			"minWidth",
			"sortable",
			"sortOrders",
			"resizable",
			"showOverflowTooltip",
		]);

		useRender(() => (
			<Fragment>
				{
					// 如果有配置多级表头的数据，则递归该组件
					props._children?.length ? (
						<ElTableColumn
							{...elTableColumnProps.value}
							className={getClassName()}
							minWidth={getWidth("auto")}
							sortable={props.sortable ? "custom" : false}
							sortOrders={props.sortOrders}
							resizable={props.resizable && !props.autoWidth}
							showOverflowTooltip={(props.showOverflowTooltip ?? true) && !props.autoWidth && props.type === "default"}
						>
							{{
								header: ({ column, $index }: { column: TableColumnCtx<DefaultRow>; $index: number }) =>
									headerRender({ column, $index }),
								default: () =>
									(props._children ?? []).map((col: FaTableColumnCtx) =>
										h(
											resolveComponent("FaTableColumn"),
											{
												...col,
											},
											slots
										)
									),
							}}
						</ElTableColumn>
					) : props.type === "image" ? (
						<ElTableColumn
							{...elTableColumnProps.value}
							align="center"
							className="fa-table__image-column"
							minWidth="50px"
							sortable={false}
							resizable={false}
							showOverflowTooltip={false}
						>
							{{
								header: ({ column, $index }: { column: TableColumnCtx<DefaultRow>; $index: number }) =>
									headerRender({ column, $index }),
								default: ({ row }: { row: DefaultRow; column: TableColumnCtx<DefaultRow>; $index: number }) => {
									const cellValue = tableUtil.handleRowAccordingToProp(row, props.prop ?? "");
									const renderValue = displayText(cellValue);
									return renderValue ? (
										props.hideImage ? (
											<ElImage
												class="fa-image"
												lazy
												src={artwork}
												fit="cover"
												previewSrcList={[renderValue]}
												closeOnPressEscape
												hideOnClickModal
												previewTeleported
											/>
										) : (
											<FaImage lazy src={renderValue} fit="cover" original={props.originalImage} thumb />
										)
									) : (
										<ElImage class="fa-image" lazy src={notImage} fit="cover" />
									);
								},
							}}
						</ElTableColumn>
					) : (
						// 其他正常的列
						<ElTableColumn
							{...elTableColumnProps.value}
							type={props.type === "selection" || props.type === "index" || props.type === "expand" ? props.type : "default"}
							className={getClassName()}
							minWidth={getWidth("auto")}
							sortable={props.sortable ? "custom" : false}
							sortOrders={props.sortOrders}
							resizable={props.resizable && !props.autoWidth}
							showOverflowTooltip={(props.showOverflowTooltip ?? true) && !props.autoWidth && props.type === "default"}
						>
							{{
								header: ({ column, $index }: { column: TableColumnCtx<DefaultRow>; $index: number }) =>
									slots.header
										? slots.header({ column: columnCtx.value, $index, ...getTableDefaultSlots(tableState) })
										: headerRender({ column, $index }),
								default: ({ row, column, $index }: { row: DefaultRow; column: TableColumnCtx<DefaultRow>; $index: number }) =>
									slots.default
										? slots.default({ row, column: columnCtx.value, $index, ...getTableDefaultSlots(tableState) })
										: defaultRender({ row, column, $index }),
								filterIcon: ({ filterOpened }: { filterOpened: boolean }) =>
									slots.filterIcon?.({ filterOpened, ...getTableDefaultSlots(tableState) }),
								expand: ({ expanded }: { expanded: boolean }) => slots.expand?.({ expanded, ...getTableDefaultSlots(tableState) }),
							}}
						</ElTableColumn>
					)
				}
			</Fragment>
		));
	},
});
