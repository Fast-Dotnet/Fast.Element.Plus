/**
 * 安全写入结果对象的自有可枚举属性。
 *
 * @remarks 使用 `defineProperty` 避免 `__proto__` 触发 Setter，并统一创建可写、可配置的自有可枚举数据属性。
 * @param target - 要写入的结果对象
 * @param key - 自有属性键
 * @param value - 属性值
 */
const defineEnumerableProperty = (target: object, key: PropertyKey, value: unknown): void => {
	Object.defineProperty(target, key, { configurable: true, enumerable: true, value, writable: true });
};

const typedArrayTags = new Set([
	"[object BigInt64Array]",
	"[object BigUint64Array]",
	"[object Float32Array]",
	"[object Float64Array]",
	"[object Int8Array]",
	"[object Int16Array]",
	"[object Int32Array]",
	"[object Uint8Array]",
	"[object Uint8ClampedArray]",
	"[object Uint16Array]",
	"[object Uint32Array]",
]);

/** 深度比较过程中用于识别循环引用的双向对象映射 */
interface EqualityState {
	readonly leftObjects: WeakMap<object, object>;
	readonly rightObjects: WeakMap<object, object>;
}

/** 判断两个值是否满足 SameValueZero 相等。 */
const sameValueZero = (left: unknown, right: unknown): boolean =>
	left === right || (typeof left === "number" && typeof right === "number" && Number.isNaN(left) && Number.isNaN(right));

/** 返回对象的自有可枚举字符串与 Symbol 键。 */
const getEnumerableOwnKeys = (value: object): PropertyKey[] =>
	Reflect.ownKeys(value).filter((key) => Object.prototype.propertyIsEnumerable.call(value, key));

/** 在一次递归分支内记录对象对应关系。 */
const compareTrackedPair = (left: object, right: object, state: EqualityState, compare: () => boolean): boolean => {
	const existingRight = state.leftObjects.get(left);
	const existingLeft = state.rightObjects.get(right);
	if (existingRight !== undefined || existingLeft !== undefined) return existingRight === right && existingLeft === left;
	state.leftObjects.set(left, right);
	state.rightObjects.set(right, left);
	try {
		return compare();
	} finally {
		state.leftObjects.delete(left);
		state.rightObjects.delete(right);
	}
};

/** 按字节比较两个 ArrayBufferLike。 */
const equalArrayBuffers = (left: ArrayBufferLike, right: ArrayBufferLike): boolean => {
	if (left.byteLength !== right.byteLength) return false;
	const leftBytes = new Uint8Array(left);
	const rightBytes = new Uint8Array(right);
	for (let index = 0; index < leftBytes.length; index += 1) {
		if (leftBytes[index] !== rightBytes[index]) return false;
	}
	return true;
};

/** 按顺序比较数组或 TypedArray 的元素。 */
const equalIndexedValues = (
	left: { readonly [index: number]: unknown; readonly length: number },
	right: { readonly [index: number]: unknown; readonly length: number },
	state: EqualityState
): boolean => {
	if (left.length !== right.length) return false;
	return compareTrackedPair(left, right, state, () => {
		for (let index = 0; index < left.length; index += 1) {
			if (!isEqualValue(left[index], right[index], state)) return false;
		}
		return true;
	});
};

/** 无序比较 Map 条目或 Set 元素。 */
const equalUnorderedValues = (left: readonly unknown[], right: readonly unknown[], state: EqualityState): boolean => {
	if (left.length !== right.length) return false;
	const matchedIndexes = new Set<number>();
	for (const leftValue of left) {
		let matchedIndex = -1;
		for (let index = 0; index < right.length; index += 1) {
			if (matchedIndexes.has(index) || !isEqualValue(leftValue, right[index], state)) continue;
			matchedIndex = index;
			break;
		}
		if (matchedIndex < 0) return false;
		matchedIndexes.add(matchedIndex);
	}
	return true;
};

/** 比较普通对象或 Arguments 的自有可枚举属性与构造器。 */
const equalObjects = (left: object, right: object, state: EqualityState): boolean => {
	const leftKeys = getEnumerableOwnKeys(left);
	const rightKeys = getEnumerableOwnKeys(right);
	if (leftKeys.length !== rightKeys.length) return false;
	for (const key of leftKeys) {
		if (!Object.prototype.hasOwnProperty.call(right, key)) return false;
	}

	return compareTrackedPair(left, right, state, () => {
		let compareConstructors = true;
		for (const key of leftKeys) {
			if (!isEqualValue(Reflect.get(left, key), Reflect.get(right, key), state)) return false;
			if (key === "constructor") compareConstructors = false;
		}
		if (!compareConstructors) return true;
		const leftConstructor: unknown = Reflect.get(left, "constructor");
		const rightConstructor: unknown = Reflect.get(right, "constructor");
		if (leftConstructor === rightConstructor || !("constructor" in left && "constructor" in right)) return true;
		return (
			typeof leftConstructor === "function" &&
			typeof rightConstructor === "function" &&
			leftConstructor instanceof leftConstructor &&
			rightConstructor instanceof rightConstructor
		);
	});
};

/** 递归比较两个值。 */
function isEqualValue(left: unknown, right: unknown, state: EqualityState): boolean {
	if (sameValueZero(left, right)) return true;
	if (left === null || left === undefined || right === null || right === undefined) return false;

	const leftTag = Object.prototype.toString.call(left);
	const rightTag = Object.prototype.toString.call(right);
	const normalizedLeftTag = leftTag === "[object Arguments]" ? "[object Object]" : leftTag;
	const normalizedRightTag = rightTag === "[object Arguments]" ? "[object Object]" : rightTag;
	if (normalizedLeftTag !== normalizedRightTag) return false;

	switch (normalizedLeftTag) {
		case "[object Boolean]":
		case "[object Date]":
		case "[object Number]":
			return sameValueZero(Number(left), Number(right));
		case "[object Error]":
			return (left as Error).name === (right as Error).name && (left as Error).message === (right as Error).message;
		case "[object RegExp]":
			return RegExp.prototype.toString.call(left) === RegExp.prototype.toString.call(right);
		case "[object String]":
			return String.prototype.valueOf.call(left) === String.prototype.valueOf.call(right);
		case "[object Symbol]":
			return Symbol.prototype.valueOf.call(left) === Symbol.prototype.valueOf.call(right);
	}

	if (typeof left !== "object" || typeof right !== "object") return false;
	if (Array.isArray(left) && Array.isArray(right)) return equalIndexedValues(left, right, state);
	if (normalizedLeftTag === "[object ArrayBuffer]" || normalizedLeftTag === "[object SharedArrayBuffer]") {
		return equalArrayBuffers(left as ArrayBufferLike, right as ArrayBufferLike);
	}
	if (normalizedLeftTag === "[object DataView]") {
		const leftView = left as DataView;
		const rightView = right as DataView;
		return (
			leftView.byteLength === rightView.byteLength &&
			leftView.byteOffset === rightView.byteOffset &&
			equalArrayBuffers(leftView.buffer, rightView.buffer)
		);
	}
	if (typedArrayTags.has(normalizedLeftTag)) {
		return equalIndexedValues(
			left as ArrayBufferView & { readonly [index: number]: unknown; readonly length: number },
			right as ArrayBufferView & { readonly [index: number]: unknown; readonly length: number },
			state
		);
	}
	if (normalizedLeftTag === "[object Map]") {
		return compareTrackedPair(left, right, state, () =>
			equalUnorderedValues([...(left as Map<unknown, unknown>)], [...(right as Map<unknown, unknown>)], state)
		);
	}
	if (normalizedLeftTag === "[object Set]") {
		return compareTrackedPair(left, right, state, () => equalUnorderedValues([...(left as Set<unknown>)], [...(right as Set<unknown>)], state));
	}
	if (normalizedLeftTag === "[object Object]") return equalObjects(left, right, state);
	return false;
}

/**
 * 深度比较两个值是否等价。
 *
 * @remarks 原始值使用 SameValueZero 语义；支持循环引用、数组、对象、ArrayBuffer、DataView、Date、Error、Map、RegExp、Set、Symbol 和 TypedArray。
 * 对象只比较自有可枚举字符串与 Symbol 属性，函数及其他不支持的宿主对象仅在引用相同时相等。
 * @param left - 第一待比较值
 * @param right - 第二待比较值
 * @returns 两个值深度等价时返回 `true`。
 */
export function isEqual(left: unknown, right: unknown): boolean {
	return isEqualValue(left, right, { leftObjects: new WeakMap(), rightObjects: new WeakMap() });
}

/**
 * 从对象中选择指定自有可枚举属性。
 *
 * @remarks 固定键元组保留精确返回类型；动态数组中可能被选择或排除的键在返回类型中保持可选。
 * @param source - 不会被修改的源对象
 * @param keys - 需要保留的键；不存在的键被忽略。
 * @returns 新对象，保持 `keys` 的遍历顺序。
 */
export function pick<Source extends object, const Keys extends readonly (keyof Source)[]>(
	source: Source,
	keys: Keys
): number extends Keys["length"] ? Partial<Pick<Source, Keys[number]>> : Pick<Source, Keys[number]>;
export function pick<Source extends object>(source: Source, keys: readonly PropertyKey[]): Partial<Source>;
export function pick<Source extends object>(source: Source, keys: readonly PropertyKey[]): Partial<Source> {
	const result: Partial<Source> = {};
	for (const key of keys) {
		if (Object.prototype.propertyIsEnumerable.call(source, key)) defineEnumerableProperty(result, key, Reflect.get(source, key));
	}
	return result;
}

/**
 * 浅复制对象并删除指定属性。
 *
 * @remarks 固定键元组保留精确返回类型；动态数组中可能被选择或排除的键在返回类型中保持可选。
 * @param source - 不会被修改的源对象
 * @param keys - 需要排除的键
 * @returns 包含其余自有可枚举字符串与 Symbol 属性的新对象
 */
export function omit<Source extends object, const Keys extends readonly (keyof Source)[]>(
	source: Source,
	keys: Keys
): number extends Keys["length"] ? Omit<Source, Keys[number]> & Partial<Pick<Source, Keys[number]>> : Omit<Source, Keys[number]>;
export function omit<Source extends object>(source: Source, keys: readonly PropertyKey[]): Partial<Source>;
export function omit<Source extends object>(source: Source, keys: readonly PropertyKey[]): Partial<Source> {
	const result = { ...source };
	for (const key of keys) Reflect.deleteProperty(result, key);
	return result;
}
