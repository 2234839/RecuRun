/**
 * RecuRun 异步使用示例
 *
 * 展示如何使用 RecuRun 来处理异步递归问题
 */

import { runAsync, runTailAsync } from '../dist/index.js';

console.log('🚀 RecuRun 异步示例程序\n');

// ==================== 示例 1: 异步斐波那契数列 ====================

console.log('📊 示例 1: 异步斐波那契数列');
console.log('───────────────────────────────');

async function* fibonacci(n: number): AsyncGenerator<unknown, number> {
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 1));

    if (n <= 2) return 1;
    const a = yield fibonacci(n - 1);
    const b = yield fibonacci(n - 2);
    return a + b;
}

(async () => {
    console.log('fib(10) =', await runAsync(fibonacci(10)));
    console.log('fib(20) =', await runAsync(fibonacci(20)));
    console.log('fib(35) =', await runAsync(fibonacci(35)), '\n');

    // ==================== 示例 2: 异步尾递归阶乘 ====================

    console.log('🔢 示例 2: 异步尾递归阶乘');
    console.log('───────────────────────────────');

    async function* factorial(n: number, acc: number = 1): AsyncGenerator<unknown, number> {
        // 模拟异步操作
        await new Promise(resolve => setTimeout(resolve, 1));

        if (n <= 1) return acc;
        // 注意: 使用 yield (不是 yield*)
        return yield factorial(n - 1, acc * n);
    }

    console.log('5! =', await runTailAsync(factorial(5)));
    console.log('10! =', await runTailAsync(factorial(10)));
    console.log('100! =', await runTailAsync(factorial(100)));
    console.log('1000! =', await runTailAsync(factorial(1000)), '\n');

    // ==================== 示例 3: 异步数据获取 ====================

    console.log('🌐 示例 3: 异步数据获取');
    console.log('───────────────────────────────');

    interface User {
        id: number;
        name: string;
        email: string;
    }

    // 模拟异步 API
    async function fetchUser(id: number): Promise<User> {
        await new Promise(resolve => setTimeout(resolve, 10));
        return {
            id,
            name: `User ${id}`,
            email: `user${id}@example.com`
        };
    }

    async function* fetchAllUsers(ids: number[]): AsyncGenerator<unknown, User[]> {
        if (ids.length === 0) return [];

        const [first, ...rest] = ids;
        const user = await fetchUser(first);
        const otherUsers = yield fetchAllUsers(rest);

        return [user, ...otherUsers];
    }

    const userIds = [1, 2, 3, 4, 5];
    const users = await runAsync(fetchAllUsers(userIds));

    console.log('获取到的用户:');
    users.forEach((user: User) => {
        console.log(`  - ${user.name} (${user.email})`);
    });
    console.log();

    // ==================== 示例 4: 异步文件处理 ====================

    console.log('📁 示例 4: 异步文件处理');
    console.log('───────────────────────────────');

    // 模拟异步文件读取
    async function readFile(path: string): Promise<string> {
        await new Promise(resolve => setTimeout(resolve, 5));
        return `Content of ${path}`;
    }

    async function* processFiles(paths: string[]): AsyncGenerator<unknown, string[]> {
        if (paths.length === 0) return [];

        const [first, ...rest] = paths;
        const content = await readFile(first);
        const otherContents = yield processFiles(rest);

        return [content, ...otherContents];
    }

    const files = ['file1.txt', 'file2.txt', 'file3.txt'];
    const contents = await runAsync(processFiles(files));

    console.log('处理文件:');
    contents.forEach((content: string, index: number) => {
        console.log(`  ${index + 1}. ${content.substring(0, 20)}...`);
    });
    console.log();

    // ==================== 示例 5: 异步超深递归 ====================

    console.log('🚀 示例 5: 异步超深递归');
    console.log('───────────────────────────────');

    async function* asyncDeepCounter(n: number): AsyncGenerator<unknown, number> {
        // 模拟异步操作
        await new Promise(resolve => setTimeout(resolve, 0));

        if (n <= 0) return 0;
        return yield asyncDeepCounter(n - 1);
    }

    console.log('处理深度为 10000 的异步递归...');
    const start = Date.now();
    const result = await runTailAsync(asyncDeepCounter(10000));
    const duration = Date.now() - start;

    console.log(`✅ 成功! 结果: ${result}, 耗时: ${duration}ms\n`);

    // ==================== 示例 6: 异步链表遍历 ====================

    console.log('🔗 示例 6: 异步链表遍历');
    console.log('───────────────────────────────');

    interface AsyncListNode {
        value: number;
        next?: AsyncListNode;
        // 模拟异步数据加载
        loadNext(): Promise<void>;
    }

    class AsyncListNodeImpl implements AsyncListNode {
        value: number;
        next?: AsyncListNode;

        constructor(value: number) {
            this.value = value;
        }

        async loadNext(): Promise<void> {
            // 模拟异步加载
            await new Promise(resolve => setTimeout(resolve, 5));
            if (this.value < 5) {
                this.next = new AsyncListNodeImpl(this.value + 1);
            }
        }
    }

    async function* traverseAsyncList(node: AsyncListNode | undefined, acc: number = 0): AsyncGenerator<unknown, number> {
        if (!node) return acc;

        // 异步加载下一个节点
        await node.loadNext();

        return yield traverseAsyncList(node.next, acc + node.value);
    }

    const list = new AsyncListNodeImpl(1);
    const sum = await runTailAsync(traverseAsyncList(list));
    console.log(`链表元素之和: ${sum}\n`);

    console.log('✨ 所有异步示例运行完成!');
    console.log('\n提示: RecuRun 的异步版本让你用递归的思维方式写异步代码,');
    console.log('      却以迭代的方式运行,告别栈溢出和回调地狱! 🎉\n');
})();
