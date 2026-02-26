# RecuRun: Recursive Runner Library

> **Write Recursive, Run Iterative** — Write code in a recursive style but execute it iteratively, avoiding stack overflow.

A lightweight, zero-dependency TypeScript library that allows you to write code in a recursive style but execute it iteratively. Say goodbye to stack overflow and embrace infinite recursion!

[![npm version](https://img.shields.io/npm/v/recurun.svg)](https://www.npmjs.com/package/recurun)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://img.shields.io/badge/tests-26%20passing-brightgreen.svg)](https://github.com/2234839/RecuRun)

**[简体中文](./README_zh.md)** | English

## ✨ Features

- 🚀 **Zero Dependencies** - Pure TypeScript implementation
- 🔒 **Type Safe** - Full TypeScript type support with excellent IDE hints
- ⚡ **High Performance** - Optimized stack management and call mechanism
- 🛡️ **Stable & Reliable** - Clear rules, no magic auto-detection
- 📦 **Lightweight** - < 1KB when minified
- 🧪 **Well Tested** - 26 comprehensive tests covering all recursion patterns (sync & async)

## Installation

```bash
npm install recurun
# or
yarn add recurun
# or
pnpm add recurun
```

## Quick Start

### 🔄 From Normal Recursion to Safe Recursion

**Before** (Normal recursion - stack overflow on large inputs):

```typescript
// ❌ Stack overflow on n > 10000
function factorial(n: number, acc: number = 1): number {
    if (n <= 1) return acc;
    return factorial(n - 1, acc * n);
}
```

**After** (With RecuRun - handles any depth):

```typescript
// ✅ No stack overflow, even on n = 100000!
import { runTail } from 'recurun';

function* factorial(n: number, acc: number = 1): Generator<any, number> {
    if (n <= 1) return acc;
    return yield factorial(n - 1, acc * n);  // Just add `yield` keyword!
}

const result = runTail(factorial(100000)); // Works! 🎉
```

**That's it!** Just three simple changes:
1. Add `function*` to make it a generator
2. Add `yield` before recursive calls
3. Wrap with `run()` or `runTail()`

### Examples

```typescript
import { run, runTail } from 'recurun';

// Example 1: Fibonacci sequence (any recursion)
function* fibonacci(n: number): Generator<any, number> {
    if (n <= 2) return 1;
    const a = yield fibonacci(n - 1);
    const b = yield fibonacci(n - 2);
    return a + b;
}

console.log(run(fibonacci(40))); // 102334155

// Example 2: Tail-recursive factorial (with optimization)
function* factorial(n: number, acc: number = 1): Generator<any, number> {
    if (n <= 1) return acc;
    // Note: use yield (not yield*) with runTail
    return yield factorial(n - 1, acc * n);
}

// Can safely calculate very large numbers
console.log(runTail(factorial(100000))); // No stack overflow!
```

## 🆕 Async Support

RecuRun now supports async generators (`async function*`) for handling asynchronous recursive operations!

```typescript
import { runAsync, runTailAsync } from 'recurun';

// Example: Async Fibonacci
async function* fibonacci(n: number): Promise<number> {
    await new Promise(r => setTimeout(r, 10)); // Simulate async operation
    if (n <= 2) return 1;
    const a = yield fibonacci(n - 1);
    const b = yield fibonacci(n - 2);
    return a + b;
}

console.log(await runAsync(fibonacci, 20)); // 6765

// Example: Async Tail Recursion
async function* factorial(n: number, acc: number = 1): Promise<number> {
    await new Promise(r => setTimeout(r, 10)); // Simulate async operation
    if (n <= 1) return acc;
    return yield factorial(n - 1, acc * n);
}

console.log(await runTailAsync(factorial, 10000)); // Infinity, no stack overflow!
```

## 🔄 Supported Recursion Patterns

RecuRun supports **all common recursion patterns**:

| Pattern | Description | Status |
|---------|-------------|--------|
| **Linear Recursion** | Single recursive call path | ✅ Tested |
| **Tail Recursion** | Recursive call is the last operation | ✅ Optimized (O(1) space) |
| **Binary Recursion** | Two recursive calls (e.g., Fibonacci) | ✅ Tested |
| **Multi-way Recursion** | Three or more recursive calls | ✅ Tested |
| **Mutual Recursion** | Functions calling each other | ✅ Tested |
| **Nested Recursion** | Recursive call as parameter | ✅ Tested |
| **Conditional Branching** | Different recursion paths based on conditions | ✅ Tested |
| **Tree Traversal** | Recursive data structure navigation | ✅ Tested |
| **Deep Recursion** | Depth > 100,000 | ✅ Tested |

Check out [test/test.ts](https://github.com/2234839/RecuRun/blob/main/test/test.ts) for examples of all patterns!

## API Documentation

### `run(genFunc, ...args)`

Runs any recursive function using stack simulation to avoid stack overflow.

**Use when:**
- Multiple recursion branches
- Need to perform operations after recursive calls
- Tree structure traversal

```typescript
function run<T, TReturn>(
  genFunc: (...args: any[]) => Generator<T, TReturn>,
  ...args: any[]
): TReturn
```

**Example:**

```typescript
// Fibonacci sequence
function* fib(n: number): Generator<any, number> {
  if (n <= 2) return 1;
  const a = yield fib(n - 1);
  const b = yield fib(n - 2);
  return a + b;
}

const result = run(fib, 10); // 55

// Tree traversal
function* traverse(node: TreeNode): Generator<any, number> {
  if (!node) return 0;
  const left = yield traverse(node.left);
  const right = yield traverse(node.right);
  return node.value + left + right;
}

run(traverse, rootTree);
```

### `runTail(genFunc, ...args)`

Runs tail-recursive optimized functions, achieving constant-level stack space usage.

**Use when:**
- Single recursion chain (like factorial, sum)
- Ultra-deep recursion (depth > 10,000)
- Linked list traversal

```typescript
function runTail<T, TReturn>(
  genFunc: (...args: any[]) => Generator<T, TReturn>,
  ...args: any[]
): TReturn
```

**Example:**

```typescript
// Tail-recursive factorial
function* factorial(n: number, acc: number = 1): Generator<any, number> {
  if (n <= 1) return acc;
  // Note: use yield (not yield*) - runTail assumes all calls are tail calls
  return yield factorial(n - 1, acc * n);
}

// Can safely calculate huge numbers
const result = runTail(factorial, 100000);

// Tail-recursive list traversal
function* traverseList(list: ListNode): Generator<any, number> {
  if (!list) return 0;
  return yield traverseList(list.next);
}
```

### `isGenerator(value)`

Checks if a value is a Generator object.

```typescript
function isGenerator(value: any): value is Generator
```

**Example:**

```typescript
function* gen() { yield 1; }
const g = gen();

isGenerator(g);     // true
isGenerator({});     // false
isGenerator(null);   // false
```

### `runAsync(genFunc, ...args)`

Runs any async recursive function using stack simulation to avoid stack overflow.

**Use when:**
- Handling asynchronous recursive operations
- Need to fetch/process data recursively
- Async tree structure traversal

```typescript
function runAsync<T, TReturn>(
  genFunc: (...args: any[]) => AsyncGenerator<T, TReturn>,
  ...args: any[]
): Promise<TReturn>
```

**Example:**

```typescript
// Async Fibonacci
async function* fib(n: number): Promise<number> {
  await new Promise(r => setTimeout(r, 10));
  if (n <= 2) return 1;
  const a = yield fib(n - 1);
  const b = yield fib(n - 2);
  return a + b;
}

const result = await runAsync(fib, 20);

// Async data fetching
async function* fetchAllUsers(ids: number[]): Promise<User[]> {
  if (ids.length === 0) return [];
  const user = await fetchUser(ids[0]);
  const otherUsers = yield fetchAllUsers(ids.slice(1));
  return [user, ...otherUsers];
}

const users = await runAsync(fetchAllUsers, [1, 2, 3, 4, 5]);
```

### `runTailAsync(genFunc, ...args)`

Runs async tail-recursive optimized functions with constant-level stack space usage.

**Use when:**
- Async single recursion chain
- Ultra-deep async recursion (depth > 10,000)
- Async linked list traversal

```typescript
function runTailAsync<T, TReturn>(
  genFunc: (...args: any[]) => AsyncGenerator<T, TReturn>,
  ...args: any[]
): Promise<TReturn>
```

**Example:**

```typescript
// Async tail-recursive factorial
async function* factorial(n: number, acc: number = 1): Promise<number> {
  await new Promise(r => setTimeout(r, 10));
  if (n <= 1) return acc;
  return yield factorial(n - 1, acc * n);
}

const result = await runTailAsync(factorial, 10000);

// Async list traversal
async function* traverseList(list: ListNode): Promise<number> {
  if (!list) return 0;
  await list.loadNext(); // Simulate async operation
  return yield traverseList(list.next);
}
```

### `isAsyncGenerator(value)`

Checks if a value is an AsyncGenerator object.

```typescript
function isAsyncGenerator(value: any): value is AsyncGenerator
```

**Example:**

```typescript
async function* gen() { yield 1; }
const g = gen();

isAsyncGenerator(g);     // true
isAsyncGenerator({});     // false
isAsyncGenerator(null);   // false
```

## Performance

### ⚠️ Performance Trade-offs

> **Important**: RecuRun trades performance for safety. It's slower than normal recursion but prevents stack overflow.

Run the benchmark yourself:

```bash
npm run benchmark
```

### Benchmarks

| Test Case | Depth | Normal Recursion | RecuRun | Slowdown |
|-----------|-------|------------------|---------|----------|
| **Fibonacci** | 30 | 4.6 ms ✅ | 77.4 ms ✅ | **16.9x** ⚠️ |
| **Factorial** | 1,000 | 0.15 ms ✅ | 0.44 ms ✅ | **2.9x** ⚠️ |
| **Tail Factorial** | 5,000 | 0.71 ms ✅ | 0.74 ms ✅ | **1.0x** ⚠️ |
| **Array Sum** | 5,000 elements | 0.31 ms ✅ | 1.31 ms ✅ | **4.2x** ⚠️ |
| **Deep Recursion** | 5,000 | 0.11 ms ✅ | 0.67 ms ✅ | **6.1x** ⚠️ |
| **Very Deep Recursion** | 100,000 | ❌ Stack overflow | 8.29 ms ✅ | **∞** ✅ |

### Key Takeaways

- **Small recursion (< 1,000)**: RecuRun is **3-17x slower** than normal recursion
- **Medium recursion (1,000-10,000)**: RecuRun is **1-6x slower**
- **Deep recursion (> 10,000)**: Normal recursion **overflows**, RecuRun **works**
- **Very deep recursion (> 50,000)**: **Only RecuRun can complete**

### 💡 When to Use RecuRun

| Scenario | Recommendation | Reason |
|----------|----------------|--------|
| Performance-critical code | ❌ Use normal recursion | Faster execution |
| Shallow recursion (< 1,000) | ❌ Use normal recursion | No stack risk, faster |
| Deep recursion (> 10,000) | ✅ Use RecuRun | Prevents stack overflow |
| Already have stack overflow | ✅ Use RecuRun | Minimal code changes |
| Asynchronous recursion | ✅ Use RecuRun | Native async/await support |
| Production stability | ✅ Use RecuRun | Predictable, no crashes |

> **Test environment**: Node.js v24, performance may vary by machine and workload

## Usage Guide

### When to use `run`?

Use when your recursive function has multiple branches or needs to perform operations after recursive calls:

```typescript
function* treeSum(node: TreeNode | null): Generator<any, number> {
  if (!node) return 0;

  // Need to combine results from two recursive calls
  const leftSum = yield treeSum(node.left);
  const rightSum = yield treeSum(node.right);

  return node.value + leftSum + rightSum;
}

const total = run(treeSum, root);
```

### When to use `runTail`?

Use when the recursive call is the last operation in your function:

```typescript
function* arraySum(arr: number[], index: number = 0, acc: number = 0): Generator<any, number> {
  if (index >= arr.length) return acc;
  // Tail recursive call
  return yield arraySum(arr, index + 1, acc + arr[index]);
}

const sum = runTail(arraySum, [1, 2, 3, 4, 5]); // 15
```

### Best Practices

1. **Choose the right runner**
   ```typescript
   // ✅ Correct
   return yield tailRecursive();  // Tail recursion: use runTail
   return (yield normalRecursive()) + x; // Normal recursion: use run
   ```

2. **Use `yield` not `yield*` with runTail**
   ```typescript
   // ✅ Correct
   function* factorial(n, acc = 1) {
     if (n <= 1) return acc;
     return yield factorial(n - 1, acc * n);  // Use yield
   }

   // ❌ Wrong - will cause stack overflow
   function* factorialBad(n, acc = 1) {
     if (n <= 1) return acc;
     return yield* factorialBad(n - 1, acc * n);  // Don't use yield*
   }
   ```

3. **Be careful with very deep normal recursion**
   ```typescript
   // ⚠️ Deep binary tree traversal might be slow
   function* deepTree(node: TreeNode) {
     if (!node) return;
     yield deepTree(node.left);   // Each node pushes to stack
     yield deepTree(node.right);
   }
   ```

## Real-World Examples

### Tree Traversal

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

### Linked List Operations

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

### Array Processing

```typescript
function* arraySum(arr: number[], index = 0): Generator<any, number> {
  if (index >= arr.length) return 0;
  return arr[index] + (yield arraySum(arr, index + 1));
}

const total = run(arraySum, [1, 2, 3, 4, 5]); // 15
```

## Technical Details

RecuRun uses **explicit stack simulation** to avoid stack overflow:

1. **Standard recursion (`run`)**:
   - Maintains an explicit stack array
   - Pushes to stack when `yield` encounters a generator
   - Pops from stack when generator completes
   - Space complexity: O(n)

2. **Tail recursion optimization (`runTail`)**:
   - Directly switches generators without creating new stack frames
   - Achieves constant-level stack space usage
   - Space complexity: O(1)

```
Normal recursion:
fib(5)
  ├─ fib(4)
  │   ├─ fib(3)
  │   │   └─ ...
  │   └─ fib(2)
  └─ fib(3)
      └─ ...

RecuRun (run):
Stack: [fib(5)] → [fib(5), fib(4)] → [fib(5), fib(4), fib(3)] → ...

RecuRun (runTail):
Current: factorial(100000) → factorial(99999) → factorial(99998) → ...
(Stack frame reuse, no growth!)
```

## Comparison with Traditional Trampoline

### ❌ Traditional Trampoline

```typescript
// Need to return thunks, code readability is poor
function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return () => factorial(n - 1, acc * n);  // Return function
}

const trampoline = fn => (...args) => {
  let result = fn(...args);
  while (typeof result === 'function') {
    result = result();
  }
  return result;
};
```

**Problems:**
- Need to change coding style, return thunks
- Poor code readability, unintuitive
- Difficult type inference

### ✅ RecuRun Approach

```typescript
// Maintain natural recursive writing style!
import { runTail } from 'recurun';

function* factorial(n: number, acc: number = 1) {
  if (n <= 1) return acc;
  return yield factorial(n - 1, acc * n);  // Natural recursion
}

// Safe calculation, no stack overflow
const result = runTail(factorial, 100000);
```

**Advantages:**
- Uses Generator's native syntax (`yield`)
- Maintains intuitive recursive writing
- Complete type inference and IDE support

## License

MIT © 2024 RecuRun Team

---

**RecuRun** — Write Recursive, Run Iterative. No more stack overflow, just elegant code.

**[简体中文](./README_zh.md)** | English
