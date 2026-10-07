import { withInstall, withNoopInstall } from "../../utils";
import Table, { type FaTableSlots, faTableEmits, faTableProps, tableProps } from "./src/table";
import TableColumn, { tableColumnProps } from "./src/tableColumn";
import TableColumnsSettingDialog from "./src/tableColumnSettingDialog";
import TablePagination from "./src/tablePagination";
import TableSearchForm from "./src/tableSearchForm";
import TableSearchFormItem from "./src/tableSearchFormItem";
import type { ExtractPropTypes } from "vue";
import type { TSXWithInstall } from "../../utils";

/** 集成查询、分页、列配置和枚举映射的业务表格组件。 */
export const FaTable: TSXWithInstall<typeof Table> & {
	TableColumn: typeof TableColumn;
	TableColumnsSettingDialog: typeof TableColumnsSettingDialog;
	TablePagination: typeof TablePagination;
	TableSearchForm: typeof TableSearchForm;
	TableSearchFormItem: typeof TableSearchFormItem;
} = withInstall(Table, {
	TableColumn,
	TableColumnsSettingDialog,
	TablePagination,
	TableSearchForm,
	TableSearchFormItem,
});
export default FaTable;

/** 可独立注册的 FaTable 列组件。 */
export const FaTableColumn: TSXWithInstall<typeof TableColumn> = withNoopInstall(TableColumn);

export type * from "./src/page.type";
export type * from "./src/table.state";
export type * from "./src/table.type";

export { faTableEmits, faTableProps, tableColumnProps, tableProps };
export type { FaTableSlots };
export type { FaTableColumnSlots, FaTableColumnSlotsResult } from "./src/tableColumn";

/** FaTable 暴露的组件实例类型 */
export type FaTableInstance = InstanceType<typeof Table>;

/** FaTable 的完整 Props 类型 */
export type FaTableProps = ExtractPropTypes<typeof faTableProps>;

/** FaTable 的 Emits 类型 */
export type FaTableEmits = typeof faTableEmits;

/** FaTableColumn 暴露的组件实例类型 */
export type FaTableColumnInstance = InstanceType<typeof TableColumn>;

export * from "./utils/table";
