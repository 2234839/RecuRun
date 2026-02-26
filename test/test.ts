/**
 * RecuRun 单元测试
 *
 * 使用 Node.js 内置的 test runner
 */

import { run, runTail, isGenerator, isAsyncGenerator } from '../dist/index.js';
import { describe, it } from 'node:test';
import * as assert from 'node:assert';

// ==================== 测试工具函数 ====================

describe('isGenerator', () => {
    it('应该正确识别生成器对象', () => {
        function* gen() {
            yield 1;
        }
        const g = gen();

        assert.strictEqual(isGenerator(g), true);
        assert.strictEqual(isGenerator({}), false);
        assert.strictEqual(isGenerator(null), false);
        assert.strictEqual(isGenerator(undefined), false);
        assert.strictEqual(isGenerator(() => { }), false);
        assert.strictEqual(isGenerator({ [Symbol.iterator]: () => { } }), false);
    });
});

describe('isAsyncGenerator', () => {
    it('应该正确识别异步生成器对象', () => {
        async function* gen() {
            yield 1;
        }
        const g = gen();

        assert.strictEqual(isAsyncGenerator(g), true);
        assert.strictEqual(isAsyncGenerator({}), false);
        assert.strictEqual(isAsyncGenerator(null), false);
        assert.strictEqual(isAsyncGenerator(undefined), false);
        assert.strictEqual(isAsyncGenerator(() => { }), false);
        assert.strictEqual(isAsyncGenerator({ [Symbol.asyncIterator]: () => { } }), false);
    });
});

// ==================== 测试 run 函数 ====================

describe('run', () => {
    it('应该正确计算阶乘', () => {
        function* factorial(n: number): Generator<any, number> {
            if (n <= 1) return 1;
            return n * (yield factorial(n - 1));
        }

        assert.strictEqual(run(factorial(0)), 1);
        assert.strictEqual(run(factorial(1)), 1);
        assert.strictEqual(run(factorial(5)), 120);
        assert.strictEqual(run(factorial(10)), 3628800);
    });

    it('应该正确计算斐波那契数列', () => {
        function* fibonacci(n: number): Generator<any, number> {
            if (n <= 2) return 1;
            const a = yield fibonacci(n - 1);
            const b = yield fibonacci(n - 2);
            return a + b;
        }

        assert.strictEqual(run(fibonacci(1)), 1);
        assert.strictEqual(run(fibonacci(2)), 1);
        assert.strictEqual(run(fibonacci(3)), 2);
        assert.strictEqual(run(fibonacci(5)), 5);
        assert.strictEqual(run(fibonacci(10)), 55);
    });

    it('应该能处理深度递归', () => {
        function* deepSum(n: number): Generator<any, number> {
            if (n <= 0) return 0;
            return n + (yield deepSum(n - 1));
        }

        // 普通递归在 10000+ 会栈溢出
        assert.strictEqual(run(deepSum(1000)), 500500);
        assert.strictEqual(run(deepSum(5000)), 12502500);
    });

    it('应该支持树形结构遍历', () => {
        interface TreeNode {
            value: number;
            left?: TreeNode;
            right?: TreeNode;
        }

        const tree: TreeNode = {
            value: 1,
            left: { value: 2, left: { value: 4 }, right: { value: 5 } },
            right: { value: 3, left: { value: 6 }, right: { value: 7 } }
        };

        function* traverse(node: TreeNode | undefined): Generator<any, number> {
            if (!node) return 0;
            const left = yield traverse(node.left);
            const right = yield traverse(node.right);
            return node.value + left + right;
        }

        assert.strictEqual(run(traverse(tree)), 28); // 1+2+3+4+5+6+7 = 28
    });

    it('应该支持数组操作', () => {
        function* arraySum(arr: number[], index = 0): Generator<any, number> {
            if (index >= arr.length) return 0;
            return arr[index] + (yield arraySum(arr, index + 1));
        }

        assert.strictEqual(run(arraySum([1, 2, 3, 4, 5])), 15);
        assert.strictEqual(run(arraySum([])), 0);
    });
});

// ==================== 测试 runTail 函数 ====================

describe('runTail', () => {
    it('应该正确计算尾递归阶乘', () => {
        function* factorial(n: number, acc: number = 1): Generator<any, number> {
            if (n <= 1) return acc;
            return yield factorial(n - 1, acc * n);
        }

        assert.strictEqual(runTail(factorial(0)), 1);
        assert.strictEqual(runTail(factorial(1)), 1);
        assert.strictEqual(runTail(factorial(5)), 120);
        assert.strictEqual(runTail(factorial(10)), 3628800);
    });

    it('应该能处理超深递归', () => {
        function* deepCounter(n: number): Generator<any, number> {
            if (n <= 0) return 0;
            return yield deepCounter(n - 1);
        }

        // 测试超深递归 - 真正的尾递归优化!
        assert.strictEqual(runTail(deepCounter(10000)), 0);
        assert.strictEqual(runTail(deepCounter(50000)), 0);
        assert.strictEqual(runTail(deepCounter(100000)), 0);
    });

    it('应该支持尾递归求和', () => {
        function* sum(n: number, acc: number = 0): Generator<any, number> {
            if (n <= 0) return acc;
            return yield sum(n - 1, acc + n);
        }

        assert.strictEqual(runTail(sum(10)), 55); // 1+2+...+10 = 55
        assert.strictEqual(runTail(sum(100)), 5050);
    });

    it('应该支持链表遍历', () => {
        interface ListNode {
            value: number;
            next?: ListNode;
        }

        // 创建链表: 1 -> 2 -> 3 -> 4 -> 5
        const list: ListNode = {
            value: 1,
            next: {
                value: 2,
                next: {
                    value: 3,
                    next: {
                        value: 4,
                        next: { value: 5 }
                    }
                }
            }
        };

        function* traverseList(node: ListNode | undefined, acc: number = 0): Generator<any, number> {
            if (!node) return acc;
            return yield traverseList(node.next, acc + node.value);
        }

        assert.strictEqual(runTail(traverseList(list)), 15);
    });

    it('应该支持尾递归查找', () => {
        function* findTarget(arr: number[], target: number, index = 0): Generator<any, number | null> {
            if (index >= arr.length) return null;
            if (arr[index] === target) return index;
            return yield findTarget(arr, target, index + 1);
        }

        assert.strictEqual(runTail(findTarget([1, 2, 3, 4, 5], 3)), 2);
        assert.strictEqual(runTail(findTarget([1, 2, 3, 4, 5], 6)), null);
    });
});

// ==================== 性能测试 ====================

describe('性能测试', () => {
    it('run 应该比普通递归更安全', () => {
        function* fib(n: number): Generator<any, number> {
            if (n <= 2) return 1;
            const a = yield fib(n - 1);
            const b = yield fib(n - 2);
            return a + b;
        }

        // 斐波那契数列第 35 项
        const start = Date.now();
        const result = run(fib(35));
        const duration = Date.now() - start;

        assert.strictEqual(result, 9227465);
        console.log(`  ✅ fib(35) 计算耗时: ${duration}ms`);
    });

    it('runTail 应该能处理超深递归', () => {
        function* factorial(n: number, acc: number = 1): Generator<any, number> {
            if (n <= 1) return acc;
            return yield factorial(n - 1, acc * n);
        }

        const start = Date.now();
        const result = runTail(factorial(10000));
        const duration = Date.now() - start;

        // 验证结果是 Infinity (因为太大了)
        assert.strictEqual(result, Infinity);
        console.log(`  ✅ factorial(10000) 计算耗时: ${duration}ms`);
    });
});

console.log('\n🧪 开始运行 RecuRun 测试套件...\n');
