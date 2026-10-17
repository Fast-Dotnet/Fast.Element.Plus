import { Fragment, defineComponent, inject, onBeforeUnmount, reactive, shallowRef } from "vue";
import { Rank } from "@element-plus/icons-vue";
import {
	ElIcon,
	ElInput,
	ElInputNumber,
	ElMessage,
	ElNotification,
	ElRadio,
	ElRadioGroup,
	ElSwitch,
	ElTable,
	ElTableColumn,
	ElText,
} from "element-plus";
import Sortable from "sortablejs";
import { definePropType, randomString, useExpose, useRender } from "../../../utils";
import { FaDialog } from "../../dialog";
import { tableStateKey } from "./useTable";
import type { TableColumnCtx } from "element-plus";
import type { SortableEvent } from "sortablejs";
import type { FaDialogInstance } from "../../dialog";
import type { FaTableColumnCtx } from "./table.type";

export default defineComponent({
	name: "FaTableColumnsSettingDialog",
	props: {
		/** 改变 */
		change: {
			type: definePropType<(columns: FaTableColumnCtx[]) => Promise<void>>(Function),
		},
	},
	setup(props, { expose }) {
		const tableState = inject(tableStateKey);
		if (tableState === undefined) throw new Error("FaTableColumnsSettingDialog 必须在 FaTable 内部渲染。");

		const faDialogRef = shallowRef<FaDialogInstance | null>(null);
		const sortableRef = shallowRef<Sortable | null>(null);

		const state = reactive({
			tableKey: randomString(8),
			change: false,
		});

		const indexMethod = (index: number) => index + 1;

		const tableRowDrop = () => {
			const tBody = document.querySelector<HTMLElement>(`.fa-table__column-setting-${state.tableKey} .el-table__body-wrapper tbody`);
			if (!tBody) return;

			// 销毁现有Sortable实例（如果存在）
			sortableRef.value?.destroy();

			sortableRef.value = new Sortable(tBody, {
				// ms, number 单位：ms，定义排序动画的时间
				animation: 150,
				handle: ".fa-table__column-setting-drag-handle",
				delay: 200,
				delayOnTouchOnly: true,
				touchStartThreshold: 5,
				fallbackTolerance: 3,
				onEnd(evt: SortableEvent) {
					const { newIndex, oldIndex } = evt;
					if (newIndex !== undefined && oldIndex !== undefined && newIndex !== oldIndex) {
						state.change = true;
						const curRow = tableState.orgColumns.splice(oldIndex, 1)[0];
						if (curRow) tableState.orgColumns.splice(newIndex, 0, curRow);
						tableState.orgColumns = tableState.orgColumns.map((item, index) => {
							return {
								...item,
								order: index + 1,
							};
						});
					}
				},
			});
		};

		const open = async () => {
			state.change = false;
			await faDialogRef.value?.open(() => {
				tableRowDrop();
				ElNotification({
					message: "点击保存才会进行数据缓存，点击取消为本此生效",
					type: "info",
				});
			});
		};

		const destroySortable = () => {
			sortableRef.value?.destroy();
			sortableRef.value = null;
		};

		const handleChange = async () => {
			if (state.change) {
				await props.change?.(tableState.orgColumns);
			} else {
				ElMessage.info("列配置未发生变化");
			}
		};

		const handleConfirmClick = () => {
			faDialogRef.value?.close(handleChange);
		};

		const handleOrderChange = () => {
			state.change = true;
			let orderColumns = tableState.orgColumns.filter((f) => !f.pureSearch);
			orderColumns = orderColumns.sort((a, b) => {
				if (a.order !== b.order) {
					return (a.order ?? 0) - (b.order ?? 0);
				} else {
					return orderColumns.indexOf(b) - orderColumns.indexOf(a);
				}
			});
			tableState.orgColumns = [...orderColumns, ...tableState.orgColumns.filter((f) => f.pureSearch)];
			tableState.orgColumns.forEach((item, index) => {
				item.order = index + 1;
			});
		};

		const handleColumnChange = () => {
			state.change = true;
		};

		const autoWidthDisabled = (row: FaTableColumnCtx, switchEl = false) => {
			const result: { disabled?: boolean; placeholder?: string } = {};
			if (row.type) {
				switch (row.type) {
					case "image":
						result.disabled = true;
						result.placeholder = "图片列无需配置";
						break;
					case "date":
					case "time":
					case "dateTime":
						result.disabled = true;
						result.placeholder = "时间/日期列无需配置";
						break;
					case "timeInfo":
						result.disabled = true;
						result.placeholder = "当前列无需配置";
						break;
					case "default":
					case "d2":
					case "d4":
					case "d6":
					case "gd2":
					case "gd4":
					case "gd6":
						break;
				}
			} else if (row.tag) {
				result.disabled = true;
				result.placeholder = "标签列无需配置";
			} else if (row.autoWidth) {
				result.disabled = true;
				result.placeholder = "自动列宽无需配置";
			}
			if (!result.disabled) return {};
			if (switchEl) {
				delete result.placeholder;
			}
			return result;
		};

		const pureSearchDisabled = (row: FaTableColumnCtx, switchEl = false, orderEl = false, _radioEl = false) => {
			const result: { disabled?: boolean; placeholder?: string } = {};
			if (row.pureSearch) {
				result.disabled = true;
				result.placeholder = "搜索列无需配置";
			}
			if (!result.disabled) return {};
			if (switchEl) {
				delete result.placeholder;
			}
			if (orderEl) {
				result.placeholder = "999";
			}
			return result;
		};

		onBeforeUnmount(destroySortable);

		useRender(() => (
			<FaDialog
				ref={faDialogRef}
				class="fa-table__column-setting-dialog"
				onConfirmClick={handleConfirmClick}
				showFullscreen={false}
				confirmButtonText={state.change ? "保存更改" : "确认"}
				fullHeight
				onClosed={destroySortable}
			>
				{{
					header: () => (
						<Fragment>
							列表配置（留空则恢复默认配置）
							<ElText type="info">点击保存才会进行数据缓存，点击取消为本次生效</ElText>
						</Fragment>
					),
					default: () => (
						<ElTable
							class={["fa-table__column-setting", `fa-table__column-setting-${state.tableKey}`]}
							data={tableState.orgColumns}
							rowKey="prop"
							border
						>
							{{
								default: () => (
									<Fragment>
										<ElTableColumn fixed="left" align="center" width={44}>
											{{
												default: () => (
													<ElIcon class="fa-table__column-setting-drag-handle" title="拖动调整顺序">
														<Rank />
													</ElIcon>
												),
											}}
										</ElTableColumn>
										<ElTableColumn type="index" fixed="left" align="center" width={45} index={indexMethod} />
										<ElTableColumn label="列显示名称" minWidth={200}>
											{{
												default: ({
													row,
												}: {
													row: FaTableColumnCtx;
													column: TableColumnCtx<Record<string, unknown>>;
													$index: number;
												}) =>
													row.type === "image" ? (
														<ElInput
															disabled
															readonly
															vModel={row.label}
															placeholder="请输入列显示名称"
															onChange={handleColumnChange}
														/>
													) : (
														<ElInput
															vModel={row.label}
															placeholder="请输入列显示名称"
															{...pureSearchDisabled(row)}
															onChange={handleColumnChange}
														/>
													),
											}}
										</ElTableColumn>
										<ElTableColumn label="固定" width={230}>
											{{
												default: ({
													row,
												}: {
													row: FaTableColumnCtx;
													column: TableColumnCtx<Record<string, unknown>>;
													$index: number;
												}) => (
													<ElRadioGroup
														vModel={row.fixed}
														{...pureSearchDisabled(row, false, false, true)}
														onChange={handleColumnChange}
													>
														<ElRadio value={false}>无</ElRadio>
														<ElRadio value="left">左侧</ElRadio>
														<ElRadio value="right">右侧</ElRadio>
													</ElRadioGroup>
												),
											}}
										</ElTableColumn>
										<ElTableColumn label="宽度" width={200}>
											{{
												default: ({
													row,
												}: {
													row: FaTableColumnCtx;
													column: TableColumnCtx<Record<string, unknown>>;
													$index: number;
												}) => (
													<ElInputNumber
														vModel={row.width}
														min={1}
														max={999}
														stepStrictly
														controls={false}
														placeholder="请输入宽度"
														{...autoWidthDisabled(row)}
														{...pureSearchDisabled(row)}
														onChange={handleColumnChange}
													>
														{{
															suffix: () => <span>px</span>,
														}}
													</ElInputNumber>
												),
											}}
										</ElTableColumn>
										<ElTableColumn label="小的宽度" width={200}>
											{{
												default: ({
													row,
												}: {
													row: FaTableColumnCtx;
													column: TableColumnCtx<Record<string, unknown>>;
													$index: number;
												}) => (
													<ElInputNumber
														vModel={row.smallWidth}
														min={1}
														max={999}
														stepStrictly
														controls={false}
														placeholder="请输入小的宽度"
														{...autoWidthDisabled(row)}
														{...pureSearchDisabled(row)}
														onChange={handleColumnChange}
													>
														{{
															suffix: () => <span>px</span>,
														}}
													</ElInputNumber>
												),
											}}
										</ElTableColumn>
										<ElTableColumn label="顺序" width={100}>
											{{
												default: ({
													row,
												}: {
													row: FaTableColumnCtx;
													column: TableColumnCtx<Record<string, unknown>>;
													$index: number;
												}) => (
													<ElInputNumber
														style="width: auto;"
														vModel={row.order}
														min={1}
														max={999}
														stepStrictly
														controls={false}
														placeholder="请输入顺序"
														{...pureSearchDisabled(row, false, true)}
														onChange={handleOrderChange}
													/>
												),
											}}
										</ElTableColumn>
										<ElTableColumn label="排序" width={65}>
											{{
												default: ({
													row,
												}: {
													row: FaTableColumnCtx;
													column: TableColumnCtx<Record<string, unknown>>;
													$index: number;
												}) => (
													<ElSwitch
														vModel={row.sortable}
														inlinePrompt
														activeText="是"
														inactiveText="否"
														disabled={(row.disabledSortable ?? false) || row.type === "image"}
														{...pureSearchDisabled(row, true)}
														onChange={handleColumnChange}
													/>
												),
											}}
										</ElTableColumn>
										<ElTableColumn label="复制" width={65}>
											{{
												default: ({
													row,
												}: {
													row: FaTableColumnCtx;
													column: TableColumnCtx<Record<string, unknown>>;
													$index: number;
												}) => (
													<ElSwitch
														vModel={row.copy}
														inlinePrompt
														activeText="是"
														inactiveText="否"
														disabled={!!row.type || !!row.slot}
														{...pureSearchDisabled(row, true)}
														onChange={handleColumnChange}
													/>
												),
											}}
										</ElTableColumn>
										<ElTableColumn label="自动宽度" width={85}>
											{{
												default: ({
													row,
												}: {
													row: FaTableColumnCtx;
													column: TableColumnCtx<Record<string, unknown>>;
													$index: number;
												}) => (
													<ElSwitch
														vModel={row.autoWidth}
														inlinePrompt
														activeText="是"
														inactiveText="否"
														disabled={!!row.type}
														{...pureSearchDisabled(row, true)}
														onChange={handleColumnChange}
													/>
												),
											}}
										</ElTableColumn>
										<ElTableColumn label="显示" width={75}>
											{{
												default: ({
													row,
												}: {
													row: FaTableColumnCtx;
													column: TableColumnCtx<Record<string, unknown>>;
													$index: number;
												}) => (
													<ElSwitch
														vModel={row.show}
														inlinePrompt
														activeText="显示"
														inactiveText="隐藏"
														onChange={handleColumnChange}
													/>
												),
											}}
										</ElTableColumn>
										<ElTableColumn label="搜索框名称" minWidth={200}>
											{{
												default: ({
													row,
												}: {
													row: FaTableColumnCtx;
													column: TableColumnCtx<Record<string, unknown>>;
													$index: number;
												}) =>
													row.search ? (
														<ElInput
															vModel={row.search.label}
															placeholder="请输入搜索框名称"
															onChange={handleColumnChange}
														/>
													) : (
														<ElInput disabled placeholder="当前列暂无搜索项配置" />
													),
											}}
										</ElTableColumn>
										<ElTableColumn label="搜索框顺序" width={200}>
											{{
												default: ({
													row,
												}: {
													row: FaTableColumnCtx;
													column: TableColumnCtx<Record<string, unknown>>;
													$index: number;
												}) =>
													row.search ? (
														<ElInputNumber
															vModel={row.search.order}
															min={1}
															max={999}
															stepStrictly
															controls={false}
															placeholder="请输入搜索框顺序"
															onChange={handleColumnChange}
														/>
													) : (
														<ElInputNumber
															disabled
															min={1}
															max={999}
															stepStrictly
															controls={false}
															placeholder="当前列暂无搜索项配置"
														/>
													),
											}}
										</ElTableColumn>
									</Fragment>
								),
							}}
						</ElTable>
					),
				}}
			</FaDialog>
		));

		return useExpose(expose, {
			/** 打开 */
			open,
			/** 列改变 */
			change: handleChange,
		});
	},
});
