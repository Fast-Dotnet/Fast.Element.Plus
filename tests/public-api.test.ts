import FastElementPlus, {
	type DefaultRow,
	type ElSelectorOutput,
	type ElTreeOutput,
	FaButton,
	type FaButtonInstance,
	type FaContextMenuData,
	FaDialog,
	type FaDialogInstance,
	type FaDialogSlots,
	type FaDrawerInstance,
	type FaFormInstance,
	type FaImageInstance,
	type FaImageSlots,
	type FaInputDialogPageInstance,
	type FaInputDialogPageProps,
	type FaLayoutGridBreakpoint,
	type FaLayoutGridInstance,
	type FaSelectEmits,
	type FaSelectPageEmits,
	type FaSelectPageProps,
	type FaSelectProps,
	type FaSelectV2Emits,
	type FaSelectV2Instance,
	type FaSelectV2Props,
	FaTable,
	FaTableColumn,
	type FaTableColumnType,
	type FaTableDefaultSlotsResult,
	type FaTableInstance,
	type FaTableProps,
	type FaTableSlots,
	FaTree,
	type FaTreeEmits,
	type FaTreeInstance,
	type FaTreeProps,
	type FaTreeSelectEmits,
	type FaTreeSelectInstance,
	type FaTreeSelectProps,
	type FaUploadSlots,
	type PagedInput,
	type PagedResult,
	install,
	useLoading,
	useOverlay,
	vCopy,
	version,
} from "fast-element-plus";
import "fast-element-plus/global";
import type { App, Plugin } from "vue";

const plugin: Plugin = FastElementPlus;
const installPlugin: (app: App) => void = install;
const currentVersion: string = version;

type IsAny<Value> = 0 extends 1 & Value ? true : false;
type IsEqual<Left, Right> = (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2 ? true : false;
type AssertTrue<Value extends true> = Value;
type InitParam = string | number | PagedInput;

/** 匿名业务数据的默认类型应允许调用方直接使用，同时保留显式泛型能力。 */
export type AnonymousBusinessDataChecks = [
	AssertTrue<IsAny<DefaultRow[string]>>,
	AssertTrue<IsAny<PagedInput[string]>>,
	AssertTrue<IsAny<NonNullable<PagedResult["rows"]>[number][string]>>,
	AssertTrue<IsAny<ElSelectorOutput[string]>>,
	AssertTrue<IsAny<ElTreeOutput[string]>>,
	AssertTrue<IsAny<FaContextMenuData["data"]>>,
];

/** 初始化参数必须与运行时 String、Number、Object 声明保持一致。 */
export type InitParamChecks = [
	AssertTrue<IsEqual<NonNullable<FaInputDialogPageProps["initParam"]>, InitParam>>,
	AssertTrue<IsEqual<NonNullable<FaSelectProps["initParam"]>, InitParam>>,
	AssertTrue<IsEqual<NonNullable<FaSelectPageProps["initParam"]>, InitParam>>,
	AssertTrue<IsEqual<NonNullable<FaSelectV2Props["initParam"]>, InitParam>>,
	AssertTrue<IsEqual<NonNullable<FaTableProps["initParam"]>, InitParam>>,
	AssertTrue<IsEqual<NonNullable<FaTreeProps["initParam"]>, InitParam>>,
	AssertTrue<IsEqual<NonNullable<FaTreeSelectProps["initParam"]>, InitParam>>,
];

/** 内置工具列由表格 Props 和展开插槽控制，不再作为业务列类型。 */
export type TableUtilityColumnChecks = [
	AssertTrue<IsEqual<NonNullable<FaTableProps["selectionColumn"]>, boolean>>,
	AssertTrue<IsEqual<NonNullable<FaTableProps["indexColumn"]>, boolean>>,
	AssertTrue<IsEqual<FaTableSlots["expand"]["row"], DefaultRow>>,
	AssertTrue<IsEqual<FaTableSlots["expand"]["$index"], number>>,
	AssertTrue<FaTableSlots["expand"] extends FaTableDefaultSlotsResult ? true : false>,
	AssertTrue<IsEqual<Extract<FaTableColumnType, "selection" | "index" | "expand">, never>>,
];

/** 已标准化的公共命名应直接生效，不保留旧拼写别名。 */
export type RenamedApiChecks = [
	AssertTrue<IsEqual<FaLayoutGridBreakpoint, "xs" | "sm" | "md" | "lg" | "xl">>,
	AssertTrue<"breakpoint" extends keyof FaLayoutGridInstance ? true : false>,
	AssertTrue<"onBreakpointChange" extends keyof FaLayoutGridInstance["$props"] ? true : false>,
	AssertTrue<"dataChange" extends keyof FaSelectEmits ? true : false>,
	AssertTrue<"dataChange" extends keyof FaSelectPageEmits ? true : false>,
	AssertTrue<"dataChange" extends keyof FaSelectV2Emits ? true : false>,
	AssertTrue<"dataChange" extends keyof FaTreeEmits ? true : false>,
	AssertTrue<"dataChange" extends keyof FaTreeSelectEmits ? true : false>,
];

/** 对外暴露的 Element Plus 实例成员不应退化为 any 或 unknown。 */
export type ExposedInstanceChecks = [
	AssertTrue<IsAny<FaDialogInstance["dialogContentRef"]> extends false ? true : false>,
	AssertTrue<"resetPosition" extends keyof NonNullable<FaDialogInstance["dialogContentRef"]> ? true : false>,
	AssertTrue<"updatePosition" extends keyof NonNullable<FaDialogInstance["dialogContentRef"]> ? true : false>,
];

interface TypedOptionData {
	id: number;
}

const typedOptionData: TypedOptionData | undefined = ({} as ElSelectorOutput<string, TypedOptionData>).data;
const selectV2ListRequest: NonNullable<FaSelectV2Props["requestApi"]> = (_params?: string | number | PagedInput) => Promise.resolve([]);
const selectV2PagedRequest: NonNullable<FaSelectV2Props["requestApi"]> = (_params?: string | number | PagedInput) => Promise.resolve({ rows: [] });

const button = FaButton;
const dialog = FaDialog;
const table = FaTable;
const tableColumn = FaTableColumn;
const tableColumnsSettingDialog = FaTable.TableColumnsSettingDialog;
const tablePagination = FaTable.TablePagination;
const tableSearchForm = FaTable.TableSearchForm;
const tableSearchFormItem = FaTable.TableSearchFormItem;
const tree = FaTree;

const buttonInstance = {} as FaButtonInstance;
const dialogInstance = {} as FaDialogInstance;
const drawerInstance = {} as FaDrawerInstance;
const tableInstance = {} as FaTableInstance;
const formInstance = {} as FaFormInstance;
const imageInstance = {} as FaImageInstance;
const inputDialogPageInstance = {} as FaInputDialogPageInstance;
const selectV2Instance = {} as FaSelectV2Instance;
const treeInstance = {} as FaTreeInstance;
const treeSelectInstance = {} as FaTreeSelectInstance;
const dialogSlots = {} as FaDialogSlots;
const imageSlots = {} as FaImageSlots;
const uploadSlots = {} as FaUploadSlots;

const asyncTask = (): Promise<void> => Promise.resolve();
const buttonLoadingResult: Promise<void> = buttonInstance.doLoading(asyncTask);
const dialogOpenResult: Promise<void> = dialogInstance.open(asyncTask);
const dialogCloseResult: Promise<void> = dialogInstance.close(asyncTask);
const dialogRefreshResult: Promise<void> = dialogInstance.refresh();
const dialogLoadingResult: Promise<void> = dialogInstance.doLoading(asyncTask);
const drawerOpenResult: Promise<void> = drawerInstance.open(asyncTask);
const drawerCloseResult: Promise<void> = drawerInstance.close(asyncTask);
const drawerRefreshResult: Promise<void> = drawerInstance.refresh();
const drawerLoadingResult: Promise<void> = drawerInstance.doLoading(asyncTask);
const tableLoadingResult: Promise<void> = tableInstance.doLoading(asyncTask);
const inputDialogPageOpenResult: Promise<void> = inputDialogPageInstance.open();
const tableColumnsSettingOpenResult: Promise<void> = ({} as InstanceType<typeof tableColumnsSettingDialog>).open();

/* eslint-disable no-void -- 以下表达式仅用于让 TypeScript 校验公共成员存在且避免生成额外测试结构。 */
void formInstance.getField;
void formInstance.setInitialValues;
void imageInstance.showPreview;
void selectV2ListRequest;
void selectV2PagedRequest;
void selectV2Instance.scrollTo;
void tableInstance.getHalfSelectionRows;
void treeInstance.getNodeKey;
void treeInstance.getNodePath;
void treeSelectInstance.filter;
void treeSelectInstance.selectRef;
void treeSelectInstance.treeRef;
void dialogSlots.title;
void imageSlots.toolbar;
void imageSlots.viewerError;
void imageSlots.viewerPlaceholder;
void uploadSlots.file;
void buttonLoadingResult;
void dialogOpenResult;
void dialogCloseResult;
void dialogRefreshResult;
void dialogLoadingResult;
void drawerOpenResult;
void drawerCloseResult;
void drawerRefreshResult;
void drawerLoadingResult;
void tableLoadingResult;
void inputDialogPageOpenResult;
void tableColumnsSettingOpenResult;

void tableColumnsSettingDialog;
void tablePagination;
void tableSearchForm;
void tableSearchFormItem;
void useLoading.show;
void useOverlay.hide;
void vCopy;
/* eslint-enable no-void */

export {
	button,
	buttonInstance,
	currentVersion,
	dialog,
	dialogInstance,
	installPlugin,
	plugin,
	table,
	tableColumn,
	tableInstance,
	tree,
	typedOptionData,
};
