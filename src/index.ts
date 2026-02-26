/**
 * RecuRun - 极简的递归运行器库
 *
 * 一个轻量级、零依赖的 TypeScript 库，
 * 让你用递归的方式写代码，却以迭代的方式运行。
 *
 * @packageDocumentation
 */

// ==================== 类型定义 ====================

/**
 * 栈帧接口
 *
 * @internal
 */
interface StackFrame<T, TReturn> {
    /** 生成器对象 */
    generator: Generator<T, TReturn>;
    /** 是否为尾调用 */
    isTailCall: boolean;
}

// ==================== 工具函数 ====================

/**
 * 判断变量是否为生成器对象
 *
 * 通过检查 Symbol.iterator 和 toStringTag 来判断，
 * 比单纯的 typeof 检查更可靠。
 *
 * @param v - 要检查的变量
 * @returns 如果是生成器对象返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * function* gen() { yield 1; }
 * const g = gen();
 *
 * isGenerator(g);  // true
 * isGenerator({}); // false
 * ```
 */
export function isGenerator(v: unknown): v is Generator {
    // 性能优化：使用快速路径检查
    if (typeof v !== 'object' || v === null) {
        return false;
    }
    const obj = v as Record<PropertyKey, unknown>;
    return typeof obj[Symbol.iterator] === 'function'
        && obj[Symbol.toStringTag] === 'Generator';
}

/**
 * 判断变量是否为异步生成器对象
 *
 * 通过检查 Symbol.asyncIterator 和 toStringTag 来判断。
 *
 * @param v - 要检查的变量
 * @returns 如果是异步生成器对象返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * async function* gen() { yield 1; }
 * const g = gen();
 *
 * isAsyncGenerator(g);  // true
 * isAsyncGenerator({}); // false
 * ```
 */
export function isAsyncGenerator(v: unknown): v is AsyncGenerator {
    if (typeof v !== 'object' || v === null) {
        return false;
    }
    const obj = v as Record<PropertyKey, unknown>;
    return typeof obj[Symbol.asyncIterator] === 'function'
        && obj[Symbol.toStringTag] === 'AsyncGenerator';
}

// ==================== 运行器实现 ====================

/**
 * 运行递归生成器对象（同步和异步通用）
 *
 * 使用显式栈来模拟函数调用，支持任意复杂的递归结构。
 * 每次遇到 yield 产生的生成器，都会将其推入栈中，
 * 当生成器完成后自动弹出并恢复执行。
 *
 * 自动检测生成器类型，同步生成器直接返回，异步生成器返回 Promise。
 *
 * @typeParam T - 生成器产生的值的类型
 * @typeParam TReturn - 最终返回值的类型
 * @param generator - 生成器对象（同步或异步）
 * @returns 递归函数的最终返回值（同步直接返回，异步返回 Promise）
 *
 * @example
 * ```typescript
 * // 同步斐波那契数列
 * function* fib(n: number): Generator<unknown, number> {
 *   if (n <= 2) return 1;
 *   return (yield fib(n - 1)) + (yield fib(n - 2));
 * }
 *
 * const result = run(fib(10)); // 55
 * ```
 *
 * @example
 * ```typescript
 * // 异步斐波那契数列
 * async function* fib(n: number): AsyncGenerator<unknown, number> {
 *   await new Promise(r => setTimeout(r, 1));
 *   if (n <= 2) return 1;
 *   const a = yield fib(n - 1);
 *   const b = yield fib(n - 2);
 *   return a + b;
 * }
 *
 * const result = await run(fib(10)); // 55
 * ```
 */
export function run<T, TReturn>(
    generator: Generator<T, TReturn>
): TReturn;
export function run<T, TReturn>(
    generator: AsyncGenerator<T, TReturn>
): Promise<TReturn>;
export function run<T, TReturn>(
    generator: Generator<T, TReturn> | AsyncGenerator<T, TReturn>
): TReturn | Promise<TReturn> {
    // 检测是否为异步生成器
    if (isAsyncGenerator(generator)) {
        return runAsyncImpl(generator as AsyncGenerator<T, TReturn>);
    }
    return runSyncImpl(generator as Generator<T, TReturn>);
}

/**
 * 内部同步运行器实现
 */
function runSyncImpl<T, TReturn>(
    generator: Generator<T, TReturn>
): TReturn {
    // 性能优化：预分配栈容量（常见深度 1024）
    const stack: StackFrame<T, TReturn>[] = new Array(1024);
    let stackSize = 0;

    // 当前执行的生成器
    let current: Generator<T, TReturn> = generator;

    // 返回值缓存
    let ret: T | TReturn | unknown = null;

    while (true) {
        // 驱动当前生成器
        const r = current.next(ret);

        if (r.done) {
            // 生成器执行完毕
            if (stackSize === 0) {
                return r.value;
            }

            // 弹出上一个栈帧
            stackSize--;
            const frame = stack[stackSize];
            if (!frame) {
                throw new Error('Stack frame is undefined');
            }
            current = frame.generator;
            ret = r.value;
        } else {
            // 生成器产生了一个值
            if (isGenerator(r.value)) {
                // 产生的是子生成器：压栈
                stack[stackSize] = { generator: current, isTailCall: false };
                stackSize++;

                // 切换到子生成器
                current = r.value as Generator<T, TReturn>;
                ret = null;
            } else {
                // 产生的是普通值：保存作为下次 next 的参数
                ret = r.value;
            }
        }
    }
}

/**
 * 内部异步运行器实现
 */
async function runAsyncImpl<T, TReturn>(
    generator: AsyncGenerator<T, TReturn>
): Promise<TReturn> {
    // 性能优化：预分配栈容量
    const stack: Array<{ generator: AsyncGenerator<T, TReturn>; isTailCall: boolean }> = new Array(1024);
    let stackSize = 0;

    // 当前执行的异步生成器
    let current: AsyncGenerator<T, TReturn> = generator;

    // 返回值缓存
    let ret: T | TReturn | unknown = null;

    while (true) {
        // 驱动当前异步生成器
        const r = await current.next(ret);

        if (r.done) {
            // 异步生成器执行完毕
            if (stackSize === 0) {
                return r.value;
            }

            // 弹出上一个栈帧
            stackSize--;
            const frame = stack[stackSize];
            if (!frame) {
                throw new Error('Stack frame is undefined');
            }
            current = frame.generator;
            ret = r.value;
        } else {
            // 异步生成器产生了一个值
            if (isAsyncGenerator(r.value)) {
                // 产生的是子异步生成器：压栈
                stack[stackSize] = { generator: current, isTailCall: false };
                stackSize++;

                // 切换到子异步生成器
                current = r.value as AsyncGenerator<T, TReturn>;
                ret = null;
            } else {
                // 产生的是普通值：保存作为下次 next 的参数
                ret = r.value;
            }
        }
    }
}

/**
 * 运行尾递归优化的生成器对象（同步和异步通用）
 *
 * 针对尾递归优化的版本。当使用 yield 调用子生成器时，
 * 不会创建新的栈帧，而是直接切换到子生成器执行，
 * 从而实现常量级的栈空间使用。
 *
 * 自动检测生成器类型，同步生成器直接返回，异步生成器返回 Promise。
 *
 * @typeParam T - 生成器产生的值的类型
 * @typeParam TReturn - 最终返回值的类型
 * @param generator - 生成器对象（同步或异步）
 * @returns 递归函数的最终返回值（同步直接返回，异步返回 Promise）
 *
 * @example
 * ```typescript
 * // 同步尾递归阶乘
 * function* factorial(n: number, acc: number = 1): Generator<unknown, number> {
 *   if (n <= 1) return acc;
 *   return yield factorial(n - 1, acc * n);
 * }
 *
 * const result = runTail(factorial(100000));
 * ```
 *
 * @example
 * ```typescript
 * // 异步尾递归阶乘
 * async function* factorial(n: number, acc: number = 1): AsyncGenerator<unknown, number> {
 *   await new Promise(r => setTimeout(r, 1));
 *   if (n <= 1) return acc;
 *   return yield factorial(n - 1, acc * n);
 * }
 *
 * const result = await runTail(factorial(100000));
 * ```
 */
export function runTail<T, TReturn>(
    generator: AsyncGenerator<T, TReturn>
): Promise<TReturn>;
export function runTail<T, TReturn>(
    generator: Generator<T, TReturn>
): TReturn;
export function runTail<T, TReturn>(
    generator: Generator<T, TReturn> | AsyncGenerator<T, TReturn>
): TReturn | Promise<TReturn> {
    // 检测是否为异步生成器
    if (isAsyncGenerator(generator)) {
        return runTailAsyncImpl(generator as AsyncGenerator<T, TReturn>);
    }
    return runTailSyncImpl(generator as Generator<T, TReturn>);
}

/**
 * 内部同步尾递归运行器实现
 */
function runTailSyncImpl<T, TReturn>(
    generator: Generator<T, TReturn>
): TReturn {
    let current: Generator<T, TReturn> = generator;
    let ret: T | TReturn | unknown = null;

    while (true) {
        const r = current.next(ret);

        if (r.done) {
            return r.value;
        } else {
            const value = r.value;

            // 检查是否为生成器函数(延迟求值)
            if (typeof value === 'function') {
                // 调用生成器函数,获取生成器对象
                const gen = value();

                // 验证是否为有效的生成器
                if (gen && typeof gen.next === 'function') {
                    // 直接切换,不压栈(尾递归优化)
                    current = gen as Generator<T, TReturn>;
                    ret = null;
                } else {
                    throw new TypeError('runTail: Expected a Generator function, but got an invalid generator');
                }
            } else if (isGenerator(value)) {
                // 已经是生成器对象
                current = value as Generator<T, TReturn>;
                ret = null;
            } else {
                // 普通值,保存作为下次 next 的参数
                ret = value;
            }
        }
    }
}

/**
 * 内部异步尾递归运行器实现
 */
async function runTailAsyncImpl<T, TReturn>(
    generator: AsyncGenerator<T, TReturn>
): Promise<TReturn> {
    let current: AsyncGenerator<T, TReturn> = generator;
    let ret: T | TReturn | unknown = null;

    while (true) {
        const r = await current.next(ret);

        if (r.done) {
            return r.value;
        } else {
            const value = r.value;

            // 检查是否为异步生成器函数(延迟求值)
            if (typeof value === 'function') {
                // 调用异步生成器函数,获取异步生成器对象
                const gen = await value();

                // 验证是否为有效的异步生成器
                if (gen && typeof gen.next === 'function') {
                    // 直接切换,不压栈(尾递归优化)
                    current = gen as AsyncGenerator<T, TReturn>;
                    ret = null;
                } else {
                    throw new TypeError('runTail: Expected an AsyncGenerator function, but got an invalid generator');
                }
            } else if (isAsyncGenerator(value)) {
                // 已经是异步生成器对象
                current = value as AsyncGenerator<T, TReturn>;
                ret = null;
            } else {
                // 普通值,保存作为下次 next 的参数
                ret = value;
            }
        }
    }
}

// ==================== 默认导出 ====================

export default {
    run,
    runTail,
    isGenerator,
    isAsyncGenerator
};

// 为了向后兼容，导出别名
export { run as runAsync, runTail as runTailAsync };
