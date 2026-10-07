/**
 * 判断文本是否可按十进制数值追加 CSS 单位。
 *
 * @param value - 已去除外围空白的文本
 * @returns 有限十进制数值返回 `true`；二、八、十六进制前缀返回 `false`。
 */
const isNumericString = (value: string): boolean => {
	if (value.length === 0 || !Number.isFinite(Number(value))) return false;
	const unsigned = value.startsWith("+") || value.startsWith("-") ? value.slice(1) : value;
	return !/^0[box]/iu.test(unsigned);
};

/**
 * 为数值或纯数字字符串添加 CSS 单位。
 *
 * @param value - 数字、数字字符串或已有单位的 CSS 值；空值返回空字符串。
 * @param unit - 非零数字使用的单位，默认 `px`
 * @returns 零统一返回 `"0"`；非数字字符串保持原样。
 * @throws `RangeError` 当数字非有限或单位为空。
 */
export function addCssUnit(value?: string | number | null, unit = "px"): string {
	if (value === null || value === undefined || value === "") return "";
	if (unit.length === 0) throw new RangeError("`unit` must not be empty.");
	if (typeof value === "number") {
		if (!Number.isFinite(value)) throw new RangeError("`value` must be a finite number.");
		return value === 0 ? "0" : `${value}${unit}`;
	}
	const trimmed = value.trim();
	if (!isNumericString(trimmed)) return value;
	return Number(trimmed) === 0 ? "0" : `${trimmed}${unit}`;
}
