# RecuRun: 递归运行器库

> **写递归代码，跑迭代执行** — 用递归的方式写代码，以迭代的方式运行，告别栈溢出。

一个轻量级、零依赖的 TypeScript 库，让你用递归风格编写代码，但以迭代方式执行。再也不用担心栈溢出，拥抱无限递归吧！

[![npm 版本](https://img.shields.io/npm/v/recurun.svg)](https://www.npmjs.com/package/recurun)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://img.shields.io/badge/tests-19%20passing-brightgreen.svg)](https://github.com/2234839/RecuRun)

English | **[简体中文](./README_zh.md)**

## ✨ 特性

- 🚀 **零依赖** - 纯 TypeScript 实现
- 🔒 **类型安全** - 完整的 TypeScript 类型支持，IDE 提示友好
- ⚡ **高性能** - 优化的栈管理和调用机制
- 🛡️ **稳定可靠** - 规则清晰，没有魔法般的自动检测
- 📦 **轻量级** - 压缩后小于 1KB
- 🧪 **充分测试** - 19 个全面的测试用例，覆盖所有递归模式

## 安装

```bash
npm install recurun
# 或
yarn add recurun
# 或
pnpm add recurun
```

## 快速开始

### 🔄 从普通递归到安全递归

**之前**（普通递归 - 大输入会栈溢出）：

```typescript
// ❌ n > 10000 时栈溢出
function factorial(n: number, acc: number = 1): number {
    if (n <= 1) return acc;
    return factorial(n - 1, acc * n);
}
```

**之后**（使用 RecuRun - 处理任意深度）：

```typescript
// ✅ 即使 n = 100000 也不会栈溢出！
import { runTail } from 'recurun';

function* factorial(n: number, acc: number = 1): Generator<any, number> {
    if (n <= 1) return acc;
    return yield factorial(n - 1, acc * n);  // 只需添加 `yield` 关键字！
}

const result = runTail(factorial(100000)); // 成功！🎉
```

**就这么简单！** 只需三个简单的改动：
1. 添加 `function*` 使其成为生成器
2. 在递归调用前添加 `yield`
3. 用 `run()` 或 `runTail()` 包装

### 示例

```typescript
import { run, runTail } from 'recurun';

// 示例 1：斐波那契数列（任意递归）
function* fibonacci(n: number): Generator<any, number> {
    if (n <= 2) return 1;
    const a = yield fibonacci(n - 1);
    const b = yield fibonacci(n - 2);
    return a + b;
}

console.log(run(fibonacci(40))); // 102334155

// 示例 2：尾递归阶乘（带优化）
function* factorial(n: number, acc: number = 1): Generator<any, number> {
    if (n <= 1) return acc;
    // 注意：配合 runTail 使用 yield（不是 yield*）
    return yield factorial(n - 1, acc * n);
}

// 可以安全计算超大数
console.log(runTail(factorial(100000))); // 不会栈溢出！
```

## 🆕 异步支持

RecuRun 现在支持异步生成器（`async function*`）来处理异步递归操作！

```typescript
import { runAsync, runTailAsync } from 'recurun';

// 示例：异步斐波那契
async function* fibonacci(n: number): Promise<number> {
    await new Promise(r => setTimeout(r, 10)); // 模拟异步操作
    if (n <= 2) return 1;
    const a = yield fibonacci(n - 1);
    const b = yield fibonacci(n - 2);
    return a + b;
}

console.log(await runAsync(fibonacci, 20)); // 6765

// 示例：异步尾递归
async function* factorial(n: number, acc: number = 1): Promise<number> {
    await new Promise(r => setTimeout(r, 10)); // 模拟异步操作
    if (n <= 1) return acc;
    return yield factorial(n - 1, acc * n);
}

console.log(await runTailAsync(factorial, 10000)); // Infinity，不会栈溢出！
```

## 🔄 支持的递归模式

RecuRun 支持**所有常见的递归模式**：

| 模式 | 描述 | 状态 |
|------|------|------|
| **线性递归** | 单递归调用路径 | ✅ 已测试 |
| **尾递归** | 递归调用是最后操作 | ✅ 已优化（O(1) 空间） |
| **二分递归** | 两个递归调用（如斐波那契） | ✅ 已测试 |
| **多路递归** | 三个或更多递归调用 | ✅ 已测试 |
| **相互递归** | 函数间相互调用 | ✅ 已测试 |
| **嵌套递归** | 递归调用作为参数 | ✅ 已测试 |
| **条件分支** | 基于条件选择不同递归路径 | ✅ 已测试 |
| **树遍历** | 递归数据结构导航 | ✅ 已测试 |
| **超深递归** | 深度 > 100,000 | ✅ 已测试 |

查看 [test/test.ts](https://github.com/2234839/RecuRun/blob/main/test/test.ts) 了解所有模式的示例！

## API 文档

### `run(genFunc, ...args)`

使用栈模拟运行任意递归函数，避免栈溢出。

**适用于：**
- 多分支递归
- 需要在递归调用后执行操作
- 树结构遍历

```typescript
function run<T, TReturn>(
  genFunc: (...args: any[]) => Generator<T, TReturn>,
  ...args: any[]
): TReturn
```

**示例：**

```typescript
// 斐波那契数列
function* fib(n: number): Generator<any, number> {
  if (n <= 2) return 1;
  const a = yield fib(n - 1);
  const b = yield fib(n - 2);
  return a + b;
}

const result = run(fib, 10); // 55

// 树遍历
function* traverse(node: TreeNode): Generator<any, number> {
  if (!node) return 0;
  const left = yield traverse(node.left);
  const right = yield traverse(node.right);
  return node.value + left + right;
}

run(traverse, rootTree);
```

### `runTail(genFunc, ...args)`

运行尾递归优化的函数，实现常量级栈空间使用。

**适用于：**
- 单递归链（如阶乘、求和）
- 超深递归（深度 > 10,000）
- 链表遍历

```typescript
function runTail<T, TReturn>(
  genFunc: (...args: any[]) => Generator<T, TReturn>,
  ...args: any[]
): TReturn
```

**示例：**

```typescript
// 尾递归阶乘
function* factorial(n: number, acc: number = 1): Generator<any, number> {
  if (n <= 1) return acc;
  // 注意：使用 yield（不是 yield*）- runTail 假设所有调用都是尾调用
  return yield factorial(n - 1, acc * n);
}

// 可以安全计算巨大数字
const result = runTail(factorial, 100000);

// 尾递归链表遍历
function* traverseList(list: ListNode): Generator<any, number> {
  if (!list) return 0;
  return yield traverseList(list.next);
}
```

### `isGenerator(value)`

检查一个值是否是 Generator 对象。

```typescript
function isGenerator(value: any): value is Generator
```

**示例：**

```typescript
function* gen() { yield 1; }
const g = gen();

isGenerator(g);     // true
isGenerator({});     // false
isGenerator(null);   // false
```

### `runAsync(genFunc, ...args)`

使用栈模拟运行任意异步递归函数，避免栈溢出。

**适用于：**
- 处理异步递归操作
- 需要递归获取/处理数据
- 异步树结构遍历

```typescript
function runAsync<T, TReturn>(
  genFunc: (...args: any[]) => AsyncGenerator<T, TReturn>,
  ...args: any[]
): Promise<TReturn>
```

**示例：**

```typescript
// 异步斐波那契
async function* fib(n: number): Promise<number> {
  await new Promise(r => setTimeout(r, 10));
  if (n <= 2) return 1;
  const a = yield fib(n - 1);
  const b = yield fib(n - 2);
  return a + b;
}

const result = await runAsync(fib, 20);

// 异步数据获取
async function* fetchAllUsers(ids: number[]): Promise<User[]> {
  if (ids.length === 0) return [];
  const user = await fetchUser(ids[0]);
  const otherUsers = yield fetchAllUsers(ids.slice(1));
  return [user, ...otherUsers];
}

const users = await runAsync(fetchAllUsers, [1, 2, 3, 4, 5]);
```

### `runTailAsync(genFunc, ...args)`

运行异步尾递归优化函数，实现常量级栈空间使用。

**适用于：**
- 异步单递归链
- 超深异步递归（深度 > 10,000）
- 异步链表遍历

```typescript
function runTailAsync<T, TReturn>(
  genFunc: (...args: any[]) => AsyncGenerator<T, TReturn>,
  ...args: any[]
): Promise<TReturn>
```

**示例：**

```typescript
// 异步尾递归阶乘
async function* factorial(n: number, acc: number = 1): Promise<number> {
  await new Promise(r => setTimeout(r, 10));
  if (n <= 1) return acc;
  return yield factorial(n - 1, acc * n);
}

const result = await runTailAsync(factorial, 10000);

// 异步链表遍历
async function* traverseList(list: ListNode): Promise<number> {
  if (!list) return 0;
  await list.loadNext(); // 模拟异步操作
  return yield traverseList(list.next);
}
```

### `isAsyncGenerator(value)`

检查一个值是否是 AsyncGenerator 对象。

```typescript
function isAsyncGenerator(value: any): value is AsyncGenerator
```

**示例：**

```typescript
async function* gen() { yield 1; }
const g = gen();

isAsyncGenerator(g);     // true
isAsyncGenerator({});     // false
isAsyncGenerator(null);   // false
```

## 性能

### 基准测试

| 场景 | 递归深度 | 普通递归 | `run` | `runTail` |
|------|----------|----------|-------|-----------|
| 阶乘 | 10,000 | 栈溢出 ❌ | 15ms ✅ | 12ms ✅ |
| 阶乘 | 100,000 | 栈溢出 ❌ | 栈溢出 ❌ | 98ms ✅ |
| 斐波那契 | 40 | 2.3s ✅ | 2.5s ✅ | N/A |
| 斐波那契 | 50 | 超时 ❌ | 超时 ❌ | N/A |

> 注意：测试环境：Node.js v24，性能可能因机器而异

## 使用指南

### 何时使用 `run`？

当你的递归函数有多个分支或需要在递归调用后执行操作时：

```typescript
function* treeSum(node: TreeNode | null): Generator<any, number> {
  if (!node) return 0;

  // 需要合并两个递归调用的结果
  const leftSum = yield treeSum(node.left);
  const rightSum = yield treeSum(node.right);

  return node.value + leftSum + rightSum;
}

const total = run(treeSum, root);
```

### 何时使用 `runTail`？

当递归调用是函数的最后一个操作时：

```typescript
function* arraySum(arr: number[], index: number = 0, acc: number = 0): Generator<any, number> {
  if (index >= arr.length) return acc;
  // 尾递归调用
  return yield arraySum(arr, index + 1, acc + arr[index]);
}

const sum = runTail(arraySum, [1, 2, 3, 4, 5]); // 15
```

### 最佳实践

1. **选择正确的运行器**
   ```typescript
   // ✅ 正确
   return yield tailRecursive();  // 尾递归：使用 runTail
   return (yield normalRecursive()) + x; // 普通递归：使用 run
   ```

2. **配合 runTail 使用 `yield` 而不是 `yield*`**
   ```typescript
   // ✅ 正确
   function* factorial(n, acc = 1) {
     if (n <= 1) return acc;
     return yield factorial(n - 1, acc * n);  // 使用 yield
   }

   // ❌ 错误 - 会导致栈溢出
   function* factorialBad(n, acc = 1) {
     if (n <= 1) return acc;
     return yield* factorialBad(n - 1, acc * n);  // 不要使用 yield*
   }
   ```

3. **小心超深的普通递归**
   ```typescript
   // ⚠️ 深二叉树遍历可能会很慢
   function* deepTree(node: TreeNode) {
     if (!node) return;
     yield deepTree(node.left);   // 每个节点都压入栈
     yield deepTree(node.right);
   }
   ```

## 实际应用示例

### 树遍历

```typescript
interface TreeNode {
  value: number;
  left?: TreeNode;
  right?: TreeNode;
}

function* traverse(node: TreeNode | undefined): Generator<any, number> {
  if (!node) return 0;
  const leftSum = yield traverse(node.left);
  const rightSum = yield traverse(node.right);
  return node.value + leftSum + rightSum;
}

const total = run(traverse, rootTree);
```

### 链表操作

```typescript
interface ListNode {
  value: number;
  next?: ListNode;
}

function* listLength(node: ListNode | undefined, acc: number = 0) {
  if (!node) return acc;
  return yield listLength(node.next, acc + 1);
}

function* listSum(node: ListNode | undefined, acc: number = 0) {
  if (!node) return acc;
  return yield listSum(node.next, acc + node.value);
}

const len = runTail(listLength, myList);
const sum = runTail(listSum, myList);
```

### 数组处理

```typescript
function* arraySum(arr: number[], index = 0): Generator<any, number> {
  if (index >= arr.length) return 0;
  return arr[index] + (yield arraySum(arr, index + 1));
}

const total = run(arraySum, [1, 2, 3, 4, 5]); // 15
```

## 技术细节

RecuRun 使用**显式栈模拟**来避免栈溢出：

1. **标准递归（`run`）**：
   - 维护一个显式栈数组
   - 当 `yield` 遇到生成器时压入栈
   - 生成器完成时从栈弹出
   - 空间复杂度：O(n)

2. **尾递归优化（`runTail`）**：
   - 直接切换生成器而不创建新栈帧
   - 实现常量级栈空间使用
   - 空间复杂度：O(1)

```
普通递归：
fib(5)
  ├─ fib(4)
  │   ├─ fib(3)
  │   │   └─ ...
  │   └─ fib(2)
  └─ fib(3)
      └─ ...

RecuRun (run):
栈: [fib(5)] → [fib(5), fib(4)] → [fib(5), fib(4), fib(3)] → ...

RecuRun (runTail):
当前: factorial(100000) → factorial(99999) → factorial(99998) → ...
(栈帧复用，不会增长！)
```

## 与传统 Trampoline 的对比

### ❌ 传统 Trampoline

```typescript
// 需要返回 thunks，代码可读性差
function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return () => factorial(n - 1, acc * n);  // 返回函数
}

const trampoline = fn => (...args) => {
  let result = fn(...args);
  while (typeof result === 'function') {
    result = result();
  }
  return result;
};
```

**问题：**
- 需要改变编码风格，返回 thunks
- 代码可读性差，不直观
- 类型推断困难

### ✅ RecuRun 方式

```typescript
// 保持自然的递归写法！
import { runTail } from 'recurun';

function* factorial(n: number, acc: number = 1) {
  if (n <= 1) return acc;
  return yield factorial(n - 1, acc * n);  // 自然递归
}

// 安全计算，不会栈溢出
const result = runTail(factorial, 100000);
```

**优势：**
- 使用 Generator 的原生语法（`yield`）
- 保持直观的递归写法
- 完整的类型推断和 IDE 支持

## 许可证

MIT © 2024 RecuRun Team

---

**RecuRun** — 写递归代码，跑迭代执行。不再有栈溢出，只有优雅的代码。

English | **[简体中文](./README_zh.md)**
