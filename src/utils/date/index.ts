/** 可转换为日期的输入；数字始终按 Unix 毫秒时间戳处理。 */
export type DateInput = Date | number | string;

/**
 * 转换并克隆有效日期。
 *
 * @remarks 数字不进行秒/毫秒猜测；字符串遵循运行时 `Date` 解析规则，跨平台代码应传带显式时区的完整 ISO 8601。
 * @param value - Date、Unix 毫秒时间戳或运行时可解析字符串
 * @returns 与输入不共享可变状态的新 Date
 * @throws 输入无效时抛出 `TypeError`。
 */
export function toDate(value: DateInput): Date {
	const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
	if (!Number.isFinite(date.getTime())) {
		throw new TypeError("The value is not a valid date.");
	}
	return date;
}

/**
 * 返回输入日期所在本地时区日期的 `00:00:00.000`，不修改输入。
 *
 * @param value - 有效日期输入
 * @returns 新建的本地日开始时间
 * @throws 输入无效时抛出 `TypeError`。
 */
export function startOfDay(value: DateInput): Date {
	const date = toDate(value);
	date.setHours(0, 0, 0, 0);
	return toDate(date);
}

/** 日期选择器单日期快捷项 */
export interface DateShortcut {
	/** 面向中文日期选择器的显示文本；调用方可直接用于菜单标签。 */
	text: string;
	/**
	 * 计算快捷项对应日期。
	 * @returns 每次调用时基于当前本地时间创建的新 `Date`，调用方可安全修改。
	 */
	value: () => Date;
}

/** 日期选择器范围快捷项 */
export interface DateRangeShortcut {
	/** 面向中文日期范围选择器的显示文本；调用方可直接用于菜单标签。 */
	text: string;
	/**
	 * 计算快捷项对应的本地日期范围。
	 * @returns 每次调用时创建的新元组；起点为 `00:00:00.000`，终点为 `23:59:59.999`。
	 */
	value: () => [start: Date, end: Date];
}

/** 历史快捷项允许移动的本地日历单位 */
type CalendarUnit = "day" | "month" | "year";

/**
 * 移动本地日历字段。
 *
 * @remarks 直接使用 Date Setter，以保留历史快捷项在月底和闰年的溢出语义。
 * @param date - 会被原地修改的日期
 * @param amount - 对目标字段增加的整数
 * @param unit - 要移动的日历字段
 */
const shiftCalendarFieldInPlace = (date: Date, amount: number, unit: CalendarUnit): void => {
	switch (unit) {
		case "day":
			date.setDate(date.getDate() + amount);
			break;
		case "month":
			date.setMonth(date.getMonth() + amount);
			break;
		case "year":
			date.setFullYear(date.getFullYear() + amount);
			break;
	}
};

/**
 * 创建动态单日期快捷项。
 *
 * @param text - 日期选择器显示文本
 * @param amount - 相对当前时间的移动量
 * @param unit - 移动使用的日历单位
 * @returns 每次执行 `value` 都重新读取当前时间的快捷项。
 */
const createDateShortcut = (text: string, amount: number, unit: CalendarUnit): DateShortcut => ({
	text,
	value: () => {
		const date = new Date();
		shiftCalendarFieldInPlace(date, amount, unit);
		date.setHours(0, 0, 0, 0);
		return date;
	},
});

/**
 * 创建动态日期范围快捷项。
 *
 * @param text - 日期选择器显示文本
 * @param amount - 范围边界相对当前时间的移动量
 * @param unit - 移动使用的日历单位
 * @param towardFuture - `true` 移动结束边界，`false` 移动开始边界。
 * @returns 每次求值都覆盖完整本地日边界的范围快捷项。
 */
const createRangeShortcut = (text: string, amount: number, unit: CalendarUnit, towardFuture: boolean): DateRangeShortcut => ({
	text,
	value: (): [Date, Date] => {
		const start = new Date();
		const end = new Date();
		shiftCalendarFieldInPlace(towardFuture ? end : start, towardFuture ? amount : -amount, unit);
		start.setHours(0, 0, 0, 0);
		end.setHours(23, 59, 59, 999);
		return [start, end];
	},
});

/**
 * 把日期转换为固定中文相对时间文本。
 *
 * @remarks 10 位以内数字按 Unix 秒处理，其余数字按毫秒处理；月份与年份按本地日历月差计算。
 * @param value - Date、时间戳、可解析字符串或空值
 * @returns 例如“3分钟前”“半年后”；非法或空输入返回空字符串。
 */
export function formatChineseRelativeTime(value: Date | number | string | null | undefined): string {
	if (value === null || value === undefined) return "";
	let timestamp: number;
	if (typeof value === "string") timestamp = new Date(value).getTime();
	else if (typeof value === "number") timestamp = value.toString().length <= 10 ? value * 1000 : value;
	else timestamp = value.getTime();
	if (!Number.isFinite(timestamp)) return "";

	const minute = 60_000;
	const hour = minute * 60;
	const day = hour * 24;
	const currentTimestamp = Date.now();
	const difference = currentTimestamp - timestamp;
	const minuteDifference = Math.abs(difference) / minute;
	const hourDifference = Math.abs(difference) / hour;
	const dayDifference = Math.abs(difference) / day;
	const currentDate = new Date(currentTimestamp);
	const targetDate = new Date(timestamp);
	const monthDifference = (currentDate.getFullYear() - targetDate.getFullYear()) * 12 + currentDate.getMonth() - targetDate.getMonth();
	const suffix = difference < 0 ? "后" : "前";
	if (Math.abs(monthDifference) >= 12) return `${Math.floor(Math.abs(monthDifference) / 12)}年${suffix}`;
	if (Math.abs(monthDifference) >= 6) return `半年${suffix}`;
	if (Math.abs(monthDifference) >= 1) return `${Math.abs(monthDifference)}月${suffix}`;
	if (dayDifference >= 15) return `半月${suffix}`;
	if (dayDifference >= 7) return `${Math.floor(dayDifference / 7)}周${suffix}`;
	if (dayDifference >= 1) return `${Math.floor(dayDifference)}天${suffix}`;
	if (hourDifference >= 1) return `${Math.floor(hourDifference)}小时${suffix}`;
	if (minuteDifference >= 1) return `${Math.floor(minuteDifference)}分钟${suffix}`;
	return "刚刚";
}

/**
 * 创建从今天到前后一个月日期的完整本地日范围。
 *
 * @param towardFuture - `true` 返回今天至一个月后，默认返回一个月前至今天。
 * @returns 每次调用新建的本地日首尾边界。
 */
export function createOneMonthRangeFromToday(towardFuture = false): [start: Date, end: Date] {
	const start = new Date();
	const end = new Date();
	shiftCalendarFieldInPlace(towardFuture ? end : start, towardFuture ? 1 : -1, "month");
	start.setHours(0, 0, 0, 0);
	end.setHours(23, 59, 59, 999);
	return [start, end];
}

/**
 * 创建面向过去或未来的常用完整日期范围快捷项。
 *
 * @param towardFuture - `true` 创建未来范围，默认创建历史范围。
 * @returns 每次求值都会重新读取当前时间的范围快捷项。
 */
export function createDateRangeShortcuts(towardFuture = false): DateRangeShortcut[] {
	return towardFuture
		? [
				createRangeShortcut("后1天", 1, "day", true),
				createRangeShortcut("后3天", 3, "day", true),
				createRangeShortcut("后1周", 7, "day", true),
				createRangeShortcut("后1月", 1, "month", true),
				createRangeShortcut("后3月", 3, "month", true),
				createRangeShortcut("后6月", 6, "month", true),
				createRangeShortcut("后1年", 1, "year", true),
			]
		: [
				createRangeShortcut("近1天", 1, "day", false),
				createRangeShortcut("近3天", 3, "day", false),
				createRangeShortcut("近1周", 7, "day", false),
				createRangeShortcut("近1月", 1, "month", false),
				createRangeShortcut("近3月", 3, "month", false),
				createRangeShortcut("近6月", 6, "month", false),
				createRangeShortcut("近1年", 1, "year", false),
			];
}

/**
 * 创建面向过去或未来的常用单日期快捷项。
 *
 * @param towardFuture - `true` 创建未来日期，默认创建历史日期。
 * @returns 每次求值都会重新读取当前时间的单日期快捷项。
 */
export function createDateShortcuts(towardFuture = false): DateShortcut[] {
	return towardFuture
		? [
				createDateShortcut("今天", 0, "day"),
				createDateShortcut("明天", 1, "day"),
				createDateShortcut("一周后", 7, "day"),
				createDateShortcut("一月后", 1, "month"),
				createDateShortcut("一年后", 1, "year"),
			]
		: [
				createDateShortcut("今天", 0, "day"),
				createDateShortcut("昨天", -1, "day"),
				createDateShortcut("一周前", -7, "day"),
				createDateShortcut("一月前", -1, "month"),
				createDateShortcut("一年前", -1, "year"),
			];
}

/**
 * 返回今天的本地零点。
 *
 * @returns 新建的 `00:00:00.000` Date
 */
export function getStartOfToday(): Date {
	return startOfDay(new Date());
}
