import type { PagedSortInput } from "../src/page.type";
import type { DefaultRow } from "../src/table.state";
import type { FaTableColumnCtx, FaTableEnumColumnCtx, FaTableEnumColumnType } from "../src/table.type";

/**
 * 表格工具类
 */
export const tableUtil = {
	/**
	 * 将非空数组连接为逗号分隔的文本，空数组返回 null；其他值原样返回。
	 * @param callValue - 需要处理的值
	 */
	formatValue(callValue: unknown): unknown {
		if (Array.isArray(callValue)) return callValue.length ? callValue.join(` , `) : null;
		return callValue;
	},
	/**
	 * 按点分隔的属性路径读取行数据，例如 user.name。
	 * @param row - 当前行数据
	 * @param prop - 当前 prop
	 * @returns 目标属性值；中间节点不是对象或属性不存在时返回 undefined。
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
	 * 返回点分隔属性路径的最后一级名称。
	 * @param prop - 当前 prop
	 */
	handleProp(prop: string): string {
		const propArr = prop.split(".");
		if (propArr.length === 1) return prop;
		return propArr.at(-1) ?? prop;
	},
	/**
	 * 按值匹配枚举项，并读取指定的标签字段或 Tag 类型。
	 * @param callValue - 当前单元格值
	 * @param enumData - 字典列表
	 * @param fieldNames - 标签与值的字段名
	 * @param type - 过滤类型（目前只有 tag）
	 * @returns 匹配项的标签；未匹配时返回 null。查询 Tag 类型时默认返回 info。
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
	 * 创建按排序条件依次比较行数据的函数，支持点分隔的属性路径。
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
	 * 将静态枚举或同步枚举函数的返回值存入映射。
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
	 * 收集叶子列，并补齐列的 show 默认值与枚举映射。
	 * @remarks 会修改传入列的 show 属性；嵌套子列不继承本次枚举映射参数。
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
