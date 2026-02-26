/**
 * RecuRun 使用示例
 *
 * 展示如何使用 RecuRun 来解决常见的递归问题
 */

import { run, runTail } from '../dist/index.js';

console.log('🚀 RecuRun 示例程序\n');

// ==================== 示例 1: 斐波那契数列 ====================

console.log('📊 示例 1: 斐波那契数列');
console.log('───────────────────────────────');

function* fibonacci(n: number) {
    if (n <= 2) return 1;
    const a = yield fibonacci(n - 1);
    const b = yield fibonacci(n - 2);
    return a + b;
}

console.log('fib(10) =', run(fibonacci, 10));
console.log('fib(20) =', run(fibonacci, 20));
console.log('fib(35) =', run(fibonacci, 35), '\n');

// ==================== 示例 2: 尾递归阶乘 ====================

console.log('🔢 示例 2: 尾递归阶乘');
console.log('───────────────────────────────');

function* factorial(n: number, acc: number = 1) {
    if (n <= 1) return acc;
    // 注意: runTail 中使用 yield (不是 yield*)
    return yield factorial(n - 1, acc * n);
}

console.log('5! =', runTail(factorial, 5));
console.log('10! =', runTail(factorial, 10));
console.log('100! =', runTail(factorial, 100));
console.log('1000! =', runTail(factorial, 1000), '\n');

// ==================== 示例 3: 深度优先遍历 ====================

console.log('🌲 示例 3: 树形结构遍历');
console.log('───────────────────────────────');

interface TreeNode {
    value: number;
    left?: TreeNode;
    right?: TreeNode;
}

const tree: TreeNode = {
    value: 1,
    left: {
        value: 2,
        left: { value: 4 },
        right: { value: 5 }
    },
    right: {
        value: 3,
        left: { value: 6 },
        right: { value: 7 }
    }
};

function* traverse(node: TreeNode | undefined): Generator<any, number> {
    if (!node) return 0;
    const leftSum = yield traverse(node.left);
    const rightSum = yield traverse(node.right);
    return node.value + leftSum + rightSum;
}

console.log('树的所有节点之和:', run(traverse, tree), '\n');

// ==================== 示例 4: 数组深度求和 ====================

console.log('📚 示例 4: 数组求和');
console.log('───────────────────────────────');

function* arraySum(arr: number[], index = 0): Generator<any, number> {
    if (index >= arr.length) return 0;
    return arr[index] + (yield arraySum(arr, index + 1));
}

console.log('[1, 2, 3, 4, 5] 的和:', run(arraySum, [1, 2, 3, 4, 5]));
console.log('[10, 20, 30, 40, 50] 的和:', run(arraySum, [10, 20, 30, 40, 50]), '\n');

// ==================== 示例 5: 链表操作 ====================

console.log('🔗 示例 5: 链表遍历');
console.log('───────────────────────────────');

interface ListNode {
    value: number;
    next?: ListNode;
}

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

function* listLength(node: ListNode | undefined, acc: number = 0) {
    if (!node) return acc;
    return yield listLength(node.next, acc + 1);
}

function* listSum(node: ListNode | undefined, acc: number = 0) {
    if (!node) return acc;
    return yield listSum(node.next, acc + node.value);
}

console.log('链表长度:', runTail(listLength, list));
console.log('链表元素之和:', runTail(listSum, list), '\n');

// ==================== 示例 6: 超深递归演示 ====================

console.log('🚀 示例 6: 超深递归演示');
console.log('───────────────────────────────');
console.log('普通递归在深度 > 10000 时会栈溢出');
console.log('但 RecuRun 可以安全处理!\n');

function* deepCounter(n: number): Generator<any, number> {
    if (n <= 0) return 0;
    return yield deepCounter(n - 1);
}

console.log('处理深度为 10000 的递归...');
const start = Date.now();
const result = runTail(deepCounter, 10000);
const duration = Date.now() - start;

console.log(`✅ 成功! 结果: ${result}, 耗时: ${duration}ms\n`);

// ==================== 对比演示 ====================

console.log('⚖️  性能对比');
console.log('───────────────────────────────');

function* factorialNormal(n: number, acc: number = 1) {
    if (n <= 1) return acc;
    return yield factorialNormal(n - 1, acc * n);
}

console.log('计算 10000! (尾递归优化):');
const t1 = Date.now();
runTail(factorialNormal, 10000);
const t2 = Date.now();
console.log(`⏱️  耗时: ${t2 - t1}ms\n`);

console.log('✨ 所有示例运行完成!');
console.log('\n提示: RecuRun 让你用递归的思维方式写代码,');
console.log('      却以迭代的方式运行,告别栈溢出! 🎉\n');
