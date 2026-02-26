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
interface StackFrame<T = any, TReturn = any> {
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
export function isGenerator(v: any): v is Generator {
    // 性能优化：使用快速路径检查
    return typeof v === 'object'
        && v !== null
        && typeof v[Symbol.iterator] === 'function'
        && v[Symbol.toStringTag] === 'Generator';
}

// ==================== 运行器实现 ====================

/**
 * 运行任意递归生成器函数（标准版）
 *
 * 使用显式栈来模拟函数调用，支持任意复杂的递归结构。
 * 每次遇到 yield 产生的生成器，都会将其推入栈中，
 * 当生成器完成后自动弹出并恢复执行。
 *
 * @typeParam T - 生成器产生的值的类型
 * @typeParam TReturn - 最终返回值的类型
 * @param genFunc - 生成器函数
 * @param args - 传递给生成器函数的参数
 * @returns 递归函数的最终返回值
 *
 * @example
 * ```typescript
 * // 斐波那契数列
 * function* fib(n: number): Generator<any, number> {
 *   if (n <= 2) return 1;
 *   return (yield fib(n - 1)) + (yield fib(n - 2));
 * }
 *
 * const result = run(fib, 10); // 55
 * ```
 *
 * @example
 * ```typescript
 * // 树形遍历
 * function* traverse(node: TreeNode): Generator<any, void> {
 *   if (!node) return;
 *   console.log(node.value);
 *   yield traverse(node.left);
 *   yield traverse(node.right);
 * }
 *
 * run(traverse, rootTree);
 * ```
 */
export function run<T, TReturn>(
    genFunc: (...args: any[]) => Generator<T, TReturn>,
    ...args: any[]
): TReturn {
    // 性能优化：预分配栈容量（常见深度 1024）
    const stack: StackFrame<T, TReturn>[] = new Array(1024);
    let stackSize = 0;

    // 当前执行的生成器
    let current: Generator<T, TReturn> = genFunc(...args);

    // 返回值缓存
    let ret: any = null;

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
            current = stack[stackSize].generator;
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
 * 运行尾递归优化的生成器函数
 *
 * 针对尾递归优化的版本。当使用 yield* 调用子生成器时，
 * 不会创建新的栈帧，而是直接切换到子生成器执行，
 * 从而实现常量级的栈空间使用。
 *
 * @typeParam T - 生成器产生的值的类型
 * @typeParam TReturn - 最终返回值的类型
 * @param genFunc - 生成器函数
 * @param args - 传递给生成器函数的参数
 * @returns 递归函数的最终返回值
 *
 * @example
 * ```typescript
 * // 尾递归阶乘 - 使用 yield (不是 yield*)
 * function* factorial(n: number, acc: number = 1): Generator<any, number> {
 *   if (n <= 1) return acc;
 *   // 注意:使用 yield 而不是 yield*
 *   return yield factorial(n - 1, acc * n);
 * }
 *
 * // 可以安全计算超大的数
 * const result = runTail(factorial, 100000);
 * ```
 *
 * @example
 * ```typescript
 * // 尾递归遍历
 * function* traverse(list: ListNode): Generator<any, number> {
 *   if (!list) return 0;
 *   console.log(list.value);
 *   return yield traverse(list.next);
 * }
 * ```
 */
export function runTail<T, TReturn>(
    genFunc: (...args: any[]) => Generator<T, TReturn>,
    ...args: any[]
): TReturn {
    let current: Generator<T, TReturn> = genFunc(...args);
    let ret: any = null;

    while (true) {
        const r = current.next(ret);

        if (r.done) {
            return r.value;
        } else {
            const value = r.value;

            // 检查是否为生成器函数(延迟求值)
            if (typeof value === 'function') {
                // 这是一个生成器函数,调用它来获取实际的生成器
                // 然后直接切换,不压栈(尾递归优化)
                current = value() as Generator<T, TReturn>;
                ret = null;
            } else if (isGenerator(value)) {
                // 这是已经创建的生成器对象
                // 直接切换,不压栈(尾递归优化)
                current = value as Generator<T, TReturn>;
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
    isGenerator
};
