const defaultRandomAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const maximumRandomStringLength = 1_000_000;
const maximumRandomValuesPerBatch = 16_384;
const uint32Range = 0x1_0000_0000;

/** 使用 Web Crypto 填充随机值，能力缺失时回退到 `Math.random()`。 */
const fillRandomValues = (values: Uint8Array<ArrayBuffer> | Uint32Array<ArrayBuffer>): void => {
	if (typeof crypto !== "undefined" && typeof crypto?.getRandomValues === "function") {
		crypto.getRandomValues(values);
		return;
	}
	const range = values.BYTES_PER_ELEMENT === Uint8Array.BYTES_PER_ELEMENT ? 0x100 : uint32Range;
	for (let index = 0; index < values.length; index += 1) values[index] = Math.floor(Math.random() * range);
};

/**
 * 把文本复制到系统剪贴板。
 *
 * @remarks 浏览器优先使用 Clipboard API，并在该 API 不可用时
 * 回退到 `document.execCommand("copy")`。平台拒绝访问剪贴板时不会静默忽略错误。
 * @param value - 要复制的文本
 * @returns 复制完成后兑现的 Promise
 * @throws `Error` 当运行时没有可用的剪贴板能力或复制失败。
 */
export async function copy(value: string): Promise<void> {
	if (
		typeof isSecureContext !== "undefined" &&
		isSecureContext &&
		typeof navigator !== "undefined" &&
		typeof navigator.clipboard?.writeText === "function"
	) {
		await navigator.clipboard.writeText(value);
		return;
	}

	if (typeof document === "undefined" || document === null) {
		throw new Error("The current runtime does not support clipboard access.");
	}
	// eslint-disable-next-line @typescript-eslint/no-deprecated -- 兼容不支持 Clipboard API 的旧 WebView。
	if (typeof document.createElement !== "function" || document.body == null || typeof document.execCommand !== "function") {
		throw new Error("The current runtime does not support clipboard access.");
	}
	const textarea = document.createElement("textarea");
	textarea.value = value;
	textarea.style.left = "-999999px";
	textarea.style.opacity = "0";
	textarea.style.position = "fixed";
	textarea.style.top = "-999999px";
	document.body.appendChild(textarea);
	let copied: boolean;
	try {
		textarea.focus();
		textarea.select();
		// eslint-disable-next-line @typescript-eslint/no-deprecated -- 兼容不支持 Clipboard API 的旧 WebView。
		copied = document.execCommand("copy");
	} finally {
		textarea.remove();
	}
	if (!copied) throw new Error("Failed to copy text to the clipboard.");
}

/**
 * 生成随机字符串。
 *
 * @remarks 优先使用 Web Crypto；平台缺少安全随机能力时回退到 `Math.random()`。
 * @param length - 字符数量，必须是 0 至 1,000,000 的安全整数。
 * @param alphabet - 不得为空、包含重复字符或超过 2^32 个 Unicode 码点。
 * @returns 由 `alphabet` 中 Unicode 码点组成的随机文本
 * @throws `RangeError` 当长度或字母表非法。
 */
export function randomString(length: number, alphabet: string = defaultRandomAlphabet): string {
	if (!Number.isSafeInteger(length) || length < 0 || length > maximumRandomStringLength) {
		throw new RangeError(`\`length\` must be a safe integer between 0 and ${maximumRandomStringLength}.`);
	}
	const characters = Array.from(alphabet);
	if (characters.length === 0) throw new RangeError("`alphabet` must not be empty.");
	if (new Set(characters).size !== characters.length) throw new RangeError("`alphabet` must not contain duplicate characters.");
	if (characters.length > 0x1_0000_0000) throw new RangeError("`alphabet` must not contain more than 2^32 characters.");
	if (length === 0) return "";

	// 丢弃不能平均映射到字母表的尾部区间，避免 `%` 造成前部字符概率偏高。
	const acceptanceLimit = Math.floor(uint32Range / characters.length) * characters.length;
	const result: string[] = [];
	while (result.length < length) {
		const remaining = length - result.length;
		// 分批填充可控制临时内存，并避开 Web Crypto 单次随机数组大小限制。
		const samples = new Uint32Array(Math.min(remaining, maximumRandomValuesPerBatch));
		fillRandomValues(samples);
		for (const sample of samples) {
			if (sample >= acceptanceLimit) continue;
			const character = characters[sample % characters.length];
			if (character === undefined) continue;
			result.push(character);
			if (result.length === length) break;
		}
	}
	return result.join("");
}
