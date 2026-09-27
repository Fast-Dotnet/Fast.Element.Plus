import type { PagedSortInput } from "../src/page.type";
import type { DefaultRow } from "../src/table.state";
import type { FaTableColumnCtx, FaTableEnumColumnCtx, FaTableEnumColumnType } from "../src/table.type";

/**
 * 表格工具类
 */
export const tableUtil = {
	/**
	 * 处理无数据情况
	 * @param {String} callValue 需要处理的值
	 */
	formatValue(callValue: unknown): unknown {
		// 如果当前值为数组,使用 / 拼接（根据需求自定义）
		if (Array.isArray(callValue)) return callValue.length ? callValue.join(` , `) : null;
		return callValue;
	},
	/**
	 * 处理 prop 为多级嵌套的情况(列如: prop:user.name)
	 * @param {Object} row 当前行数据
	 * @param {String} prop 当前 prop
	 */
	handleRowAccordingToProp(row: DefaultRow, prop: string): unknown {
		let value: unknown = row;
		for (const item of prop.split(".")) {
			if (typeof value !== "object" || value === null) return undefined;
			value = (value as Record<string, unknown>)[item];
		}
		return value;
	},
	/**
	 * 处理 prop，当 prop 为多级嵌套时 ==> 返回最后一级 prop
	 * @param {String} prop 当前 prop
	 */
	handleProp(prop: string): string {
		const propArr = prop.split(".");
		if (propArr.length === 1) return prop;
		return propArr.at(-1) ?? prop;
	},
	/**
	 * 根据枚举列表查询当需要的数据（如果指定了 label 和 value 的 key值，会自动识别格式化）
	 * @param {String} callValue 当前单元格值
	 * @param {Array} enumData 字典列表
	 * @param {Array} fieldNames 指定 label && value 的 key 值
	 * @param {String} type 过滤类型（目前只有 tag）
	 */
	filterEnum(callValue: unknown, enumData: FaTableEnumColumnCtx[], fieldNames?: { label: string; value: string }, type?: "tag"): unknown {
		const value = fieldNames?.value ?? "value";
		const label = fieldNames?.label ?? "label";
		const filterData = enumData.find((item) => item[value] === callValue);
		if (type === "tag") {
			return filterData?.type ?? "info";
		}
		return filterData ? filterData[label] : null;
	},
	/**
	 * 数组动态排序
	 */
	arrayDynamicSort(sortList: PagedSortInput[]): (a: DefaultRow, b: DefaultRow) => number {
		return (a, b) => {
			if (sortList.length > 0) {
				for (const condition of sortList) {
					const property = condition.enField;
					const order = condition.mode;
					if (!property) continue;

					const aValue = this.handleRowAccordingToProp(a, property);
					const bValue = this.handleRowAccordingToProp(b, property);

					if (typeof aValue === "string" && typeof bValue === "string") {
						if (order === "ascending") {
							const comparison = aValue.localeCompare(bValue, "zh-CN");
							if (comparison !== 0) {
								return comparison;
							}
						} else if (order === "descending") {
							const comparison = bValue.localeCompare(aValue, "zh-CN");
							if (comparison !== 0) {
								return comparison;
							}
						}
					} else {
						if (order === "ascending") {
							if ((aValue as string) < (bValue as string)) return -1;
							if ((aValue as string) > (bValue as string)) return 1;
						} else if (order === "descending") {
							if ((aValue as string) > (bValue as string)) return -1;
							if ((aValue as string) < (bValue as string)) return 1;
						}
					}
				}
			}

			return 0;
		};
	},
	/**
	 * 设置枚举
	 */
	setEnumMap(columnEnum: FaTableEnumColumnType, prop: string, enumMap: Map<string, FaTableEnumColumnCtx[]>): void {
		if (!columnEnum) return;
		if (typeof columnEnum === "function") {
			enumMap.set(prop, columnEnum());
		} else if (Array.isArray(columnEnum)) {
			enumMap.set(prop, columnEnum);
		}
	},
	/**
	 * 扁平化 columns
	 */
	flatColumns(columns: FaTableColumnCtx[], enumMap?: Map<string, FaTableEnumColumnCtx[]>): FaTableColumnCtx[] {
		const flatArr: FaTableColumnCtx[] = [];
		columns.forEach((col) => {
			if (col._children?.length) {
				flatArr.push(...this.flatColumns(col._children));
			}

			flatArr.push(col);

			// 给每一项 column 添加 show && filterEnum 默认属性
			col.show ??= true;
			let enumKey = col.prop ?? col.search?.key;

			if (col.enum && typeof col.enum === "string") {
				enumKey = col.enum;
			}

			// 设置 enumMap
			if (col.enum && enumKey && enumMap) this.setEnumMap(col.enum, enumKey, enumMap);
		});
		return flatArr.filter((item) => !item._children?.length);
	},
};
