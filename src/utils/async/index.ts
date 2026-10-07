/** 统一同步返回值与 PromiseLike 返回值的内部回调签名 */
type AsyncCallback<Arguments extends unknown[], Result> = (...arguments_: Arguments) => Result | PromiseLike<Result>;

/** 记录同一防抖批次中每个调用方独立的 Promise 结算函数。 */
interface PromiseWaiter<Result> {
	/**
	 * 使用批次失败原因拒绝当前调用方。
	 * @param reason - `cancel` 提供的原因或共享回调抛出的原始错误。
	 */
	reject: (reason?: unknown) => void;
	/**
	 * 使用共享回调结果完成当前调用方，并采用传入 PromiseLike 的最终状态。
	 * @param value - 当前防抖批次唯一一次回调执行产生的共享结果。
	 */
	resolve: (value: Result | PromiseLike<Result>) => void;
}

// 浏览器和 Node.js 的计时器普遍以有符号 32 位整数保存延迟；更大的值可能被
// 静默截断为约 1 ms，因此公共 API 在进入平台计时器前统一拒绝它。
const maximumTimerDelay = 2_147_483_647;

/** Promise 感知的防抖函数。 */
export interface DebouncedFunction<Arguments extends unknown[], Result> {
	/**
	 * 调度一次调用；同一等待窗口内的调用共享最后一组参数对应的结果。
	 * @param arguments_ - 传给原始回调的参数；后续调用会覆盖尚未执行批次保存的参数。
	 * @returns 当前批次的独立 Promise，最终与共享回调结果保持相同状态。
	 */
	(...arguments_: Arguments): Promise<Result>;
	/**
	 * 取消尚未执行的批次，并拒绝该批次的所有 Promise。
	 * @param reason - 可选拒绝原因；省略时使用内部取消错误。
	 */
	cancel: (reason?: unknown) => void;
	/**
	 * 立即执行待处理批次，不创建第二次回调执行。
	 * @returns 待处理批次的共享执行 Promise；没有批次时返回 `undefined`。
	 */
	flush: () => Promise<Result> | undefined;
	/** @returns 当前存在尚未开始的批次时返回 `true`；正在执行但没有等待批次时返回 `false`。 */
	pending: () => boolean;
}

/**
 * 校验宿主计时器可以稳定表示的延迟。
 *
 * @param milliseconds - 待校验的毫秒数。
 * @param name - 用于错误消息的参数名称。
 * @returns 原始延迟值，便于调用方在校验后直接使用。
 * @throws `RangeError` 当值非有限、为负数或超过 32 位计时器上限。
 */
const assertDelay = (milliseconds: number, name = "milliseconds"): number => {
	if (!Number.isFinite(milliseconds) || milliseconds < 0 || milliseconds > maximumTimerDelay) {
		throw new RangeError(`\`${name}\` 必须是 0 到 ${maximumTimerDelay} 之间的有限数。`);
	}
	return milliseconds;
};

/**
 * 创建 Promise 感知的防抖函数。
 *
 * @remarks 同一窗口内的所有调用都会等待最后一组参数对应的执行结果；回调错误会原样
 * 拒绝该批次的全部调用，不会留下永久 pending 的 Promise。
 * @param callback - 同步或异步回调。
 * @param delayMs - 0 至 2,147,483,647 的有限等待时间，默认 300 毫秒。
 * @returns 具有取消、立即执行和状态方法的防抖函数。
 * @throws `RangeError` 当延迟不在平台计时器支持范围内。
 */
export function debounce<Arguments extends unknown[], Result>(
	callback: AsyncCallback<Arguments, Result>,
	delayMs = 300
): DebouncedFunction<Arguments, Awaited<Result>> {
	const delay = assertDelay(delayMs, "delayMs");
	let timer: ReturnType<typeof setTimeout> | undefined;
	let latestArguments: Arguments | undefined;
	let waiters: PromiseWaiter<Awaited<Result>>[] = [];

	/**
	 * 执行并结算当前防抖批次。
	 *
	 * @returns 最后一组参数对应的回调结果。
	 * @throws 没有待处理批次时抛出 `Error`；回调错误会原样传播给批次中的全部调用方。
	 */
	const execute = async (): Promise<Awaited<Result>> => {
		const arguments_ = latestArguments;
		if (arguments_ === undefined) {
			throw new Error("当前没有待处理的防抖调用。");
		}
		latestArguments = undefined;
		timer = undefined;
		const currentWaiters = waiters;
		waiters = [];
		try {
			const result = await callback(...arguments_);
			currentWaiters.forEach((waiter) => {
				waiter.resolve(result);
			});
			return result;
		} catch (error) {
			currentWaiters.forEach((waiter) => {
				waiter.reject(error);
			});
			throw error;
		}
	};

	/**
	 * 更新批次参数并返回当前调用方专属的等待 Promise。
	 *
	 * @param arguments_ - 本次调用参数；同批次中只有最后一组参数会执行。
	 * @returns 与当前批次共享结果、但可独立结算的 Promise。
	 */
	const debounced = (...arguments_: Arguments) => {
		latestArguments = arguments_;
		if (timer !== undefined) clearTimeout(timer);
		timer = setTimeout(() => {
			execute().catch(() => undefined);
		}, delay);
		return new Promise<Awaited<Result>>((resolve, reject) => {
			waiters.push({ reject, resolve });
		});
	};

	debounced.cancel = (reason?: unknown) => {
		if (timer !== undefined) clearTimeout(timer);
		timer = undefined;
		latestArguments = undefined;
		const error = reason ?? new Error("防抖调用已取消。");
		waiters.forEach((waiter) => {
			waiter.reject(error);
		});
		waiters = [];
	};
	debounced.flush = () => {
		if (timer === undefined) return undefined;
		clearTimeout(timer);
		return execute();
	};
	debounced.pending = () => timer !== undefined;
	return debounced;
}
