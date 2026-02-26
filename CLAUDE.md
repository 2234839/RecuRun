# RecuRun 项目维护指南

> **最后更新**: 2026-02-26
> **当前版本**: v0.1.13

## 项目概述

RecuRun 是一个极简的递归运行器库，核心目标是用递归的方式写代码，以迭代的方式运行，避免栈溢出。

**核心特性**:
- 零依赖，纯 TypeScript 实现
- 支持同步和异步递归
- 自动检测生成器类型（通过函数重载）
- 26 个测试用例，覆盖所有递归模式
- 完整的类型安全，零 `any` 类型

---

## 架构设计原则

### 1. API 设计哲学

**统一 API，自动检测**
- ✅ 使用 `run()` 和 `runTail()`，通过函数重载自动检测同步/异步生成器
- ❌ 不要导出 `runAsync`、`runTailAsync` 等别名函数
- 理由：减少 API 表面，避免混淆，TypeScript 类型推断更好

```typescript
// ✅ 正确
export function run<T, TReturn>(generator: Generator<T, TReturn>): TReturn;
export function run<T, TReturn>(generator: AsyncGenerator<T, TReturn>): Promise<TReturn>;

// ❌ 错误 - 不要添加别名
export { run as runAsync }; // 不要这样做！
```

### 2. 类型安全原则

**禁止 `any` 类型**
- 使用 `unknown` 代替 `any`
- 使用联合类型如 `T | TReturn | unknown`
- 需要类型断言时使用 `as` 但要最小化使用

```typescript
// ✅ 正确
let ret: T | TReturn | unknown = null;

// ❌ 错误
let ret: any = null;
```

**TypeScript 严格模式**
- `tsconfig.json` 已启用所有严格检查
- 不要降低严格级别
- 遇到类型错误要正确处理，而不是绕过

### 3. 递归模式覆盖

RecuRun 必须支持以下所有递归模式：

| 模式 | 测试覆盖 | API |
|------|----------|-----|
| 线性递归 | ✅ | run() |
| 尾递归 | ✅ | runTail() (O(1) 空间) |
| 二分递归 | ✅ | run() |
| 多路递归 | ✅ | run() |
| 相互递归 | ✅ | run() |
| 嵌套递归 | ✅ | run() |
| 条件分支 | ✅ | run() |
| 树遍历 | ✅ | run() |
| 超深递归 (>100K) | ✅ | runTail() |

**所有模式必须有同步和异步测试用例。**

---

## 开发工作流

### 1. 添加新功能

**步骤**:
1. 先在 `test/test.ts` 添加测试用例
2. 实现 `src/index.ts` 功能
3. 运行 `npm test` 确保所有 26 个测试通过
4. 更新 README.md 和 README_zh.md 文档
5. 运行 `npm run build` 构建
6. 提交并推送

**示例**:
```bash
# 1. 写测试
vim test/test.ts

# 2. 实现功能
vim src/index.ts

# 3. 测试
npm test

# 4. 构建
npm run build

# 5. 提交
git add .
git commit -m "feat: description"
npm version patch  # 或 minor, major
git push origin main
git push origin --tags
```

### 2. 修复 Bug

**步骤**:
1. 在 `test/test.ts` 添加回归测试
2. 修复 `src/index.ts`
3. 验证所有测试通过
4. 更新文档（如果需要）
5. 提交并发布

### 3. 发布流程

**自动化发布**（推荐）:
```bash
# 创建版本标签，GitHub Actions 自动发布到 npm
npm version patch  # 或 minor, major
git push origin main
git push origin --tags
```

**手动发布**（不推荐，仅用于调试）:
```bash
npm run build
npm test
npm publish --provenance
```

**OIDC 配置**:
- ✅ 已配置 GitHub Actions OIDC
- ✅ 无需 NPM_TOKEN
- ✅ 在 `.github/workflows/release.yml` 中配置
- ⚠️ 不要添加 `--access public`（仅首次发布需要）
- ⚠️ 不要添加 `npm whoami` 检查步骤

---

## 项目结构

```
RecuRun/
├── src/
│   └── index.ts          # 核心实现
├── dist/                 # 构建输出（不要手动修改）
├── test/
│   └── test.ts           # 所有测试用例
├── .github/
│   └── workflows/
│       └── release.yml   # CI/CD 配置
├── README.md             # 英文文档
├── README_zh.md          # 中文文档
├── CLAUDE.md             # 本文件
├── package.json
├── tsconfig.json
└── LICENSE
```

**已删除的文件**（不要重新创建）:
- ❌ `examples/` - 示例已在 README 中
- ❌ `CLAUDE.md` - 多个位置的 CLAUDE.md 已清理
- ❌ `ASYNC_SUPPORT.md` - 文档已在 README 中
- ❌ `PROJECT_SUMMARY.md` - 不需要
- ❌ `PUBLISH_GUIDE.md` - 文档已在 README 中
- ❌ `README_zh.md` 链接已在 files 字段中

---

## 文档维护

### README.md 和 README_zh.md

**必须保持同步**:
- 新功能必须同时更新中英文文档
- Slogan: **"Write Recursive, Run Iterative"** (英文) / **"写递归代码，跑迭代执行"** (中文)
- 测试徽章必须反映实际测试数量（当前 26 passing tests）

**文档结构**:
1. 简介和 slogan
2. Badges (npm, TypeScript, License, Tests)
3. 语言切换链接
4. Features
5. Installation
6. Quick Start（包含 "从普通递归到安全递归" 的对比示例）
7. Async Support（同步和异步 API 一致）
8. Supported Recursion Patterns（9 种模式表格）
9. API Documentation
10. Usage Guide
11. Real-World Examples
12. Technical Details
13. Comparison with Traditional Trampoline
14. License

### 关键文档原则

**示例优先于解释**:
- ✅ 先展示代码示例，再解释原理
- ✅ 使用 "Before vs After" 对比展示转换过程
- ✅ 提供可运行的完整示例

**中文文档完整性**:
- ✅ README_zh.md 必须包含在 package.json 的 `files` 字段中
- ✅ 中文用户可以直接在 `node_modules/recurun/README_zh.md` 查看

---

## 测试策略

### 当前测试覆盖

- **26 个测试用例**，分为 8 个测试组
  - `isGenerator` - 1 个测试
  - `isAsyncGenerator` - 1 个测试
  - `run` - 5 个测试
  - `runTail` - 5 个测试
  - `性能测试` - 2 个测试
  - `特殊递归形式` - 5 个测试
  - `run (async)` - 3 个测试
  - `runTail (async)` - 4 个测试

### 添加新测试的原则

1. **所有递归模式必须有测试** - 添加新模式时必须添加测试
2. **同步和异步都要测试** - `run()` 和 `runTail()` 的异步行为必须有测试
3. **边界条件** - 测试空输入、单元素、极大输入
4. **性能测试** - 超深递归（> 10000 层）必须有性能测试

### 测试命名规范

```typescript
describe('run', () => {
    it('应该正确计算阶乘', () => { /* ... */ });
    it('应该正确计算斐波那契数列', () => { /* ... */ });
});

describe('runTail (async)', () => {
    it('应该正确计算异步尾递归阶乘', async () => { /* ... */ });
});
```

---

## 性能优化

### 已实现的优化

1. **栈预分配** - 预分配 1024 容量的栈数组
2. **尾递归优化** - `runTail()` 实现 O(1) 空间复杂度
3. **类型检测优化** - `isGenerator()` 和 `isAsyncGenerator()` 使用快速路径检查

### 性能基准

| 场景 | 深度 | run() | runTail() |
|------|------|-------|-----------|
| 阶乘 | 10,000 | 15ms | 12ms |
| 阶乘 | 100,000 | 栈溢出 | 98ms |
| 斐波那契 | 40 | 2.5s | N/A |

**不要过度优化**:
- 当前性能已经足够好
- 代码可读性优先于微优化
- 只有在性能测试显示问题后才优化

---

## 发布检查清单

发布前必须确认：

- [ ] 所有 26 个测试通过
- [ ] `npm run build` 成功
- [ ] README.md 和 README_zh.md 同步
- [ ] 测试徽章数量正确（当前 26）
- [ ] package.json 版本号正确
- [ ] `files` 字段包含 `README_zh.md`
- [ ] 没有使用 `any` 类型
- [ ] TypeScript 严格模式无错误
- [ ] Git 已推送到 GitHub
- [ ] 版本标签已推送

---

## 版本号策略

使用语义化版本（Semver）:

- **patch** (0.1.x → 0.1.y): Bug 修复、文档更新、性能优化
- **minor** (0.1.x → 0.2.0): 新功能、向后兼容的 API 变更
- **major** (0.x → 1.0): 破坏性变更、删除 API

**当前版本**: v0.1.13

**下一次版本**:
- 如果只修复文档或测试：`npm version patch` → v0.1.14
- 如果添加新功能（但不破坏现有 API）：`npm version minor` → v0.2.0
- 如果改变 API（不推荐）：`npm version major` → v1.0.0

---

## 已知限制和注意事项

### 1. runTail() 的尾调用检测

`runTail()` 假设所有 `yield` 都是尾调用。如果误用会导致错误结果：

```typescript
// ✅ 正确 - 尾递归
function* factorial(n, acc = 1) {
    if (n <= 1) return acc;
    return yield factorial(n - 1, acc * n);  // 尾调用
}

// ❌ 错误 - 不是尾递归，但用 runTail
function* fib(n) {
    if (n <= 2) return 1;
    const a = yield fib(n - 1);  // 不是尾调用！
    const b = yield fib(n - 2);
    return a + b;
}
```

**解决方案**: 在文档中明确说明使用场景。

### 2. 生成器类型推断

TypeScript 有时无法自动推断生成器类型，需要显式注解：

```typescript
// ✅ 正确 - 显式类型注解
function* fib(n: number): Generator<any, number> {
    if (n <= 2) return 1;
    const a = yield fib(n - 1);
    const b = yield fib(n - 2);
    return a + b;
}

// ⚠️ 可能不工作 - 无类型注解
function* fib(n) {
    // ...
}
```

---

## 社区和维护

### 贡献指南

1. 报告 Bug：在 GitHub Issues 中提供最小复现示例
2. 功能请求：描述使用场景和预期行为
3. PR 要求：
   - 所有测试必须通过
   - 必须添加或更新测试
   - 必须更新文档（中英文）
   - 必须通过 TypeScript 严格模式检查

### 发布节奏

- **不承诺固定发布周期**
- 按需发布（Bug 修复、新功能）
- 始终通过 GitHub Actions 自动发布

---

## 联系方式

- **GitHub**: https://github.com/2234839/RecuRun
- **npm**: https://www.npmjs.com/package/recurun
- **Issues**: https://github.com/2234839/RecuRun/issues

---

## 历史决策记录

### 2026-02-26: API 统一化

**决策**: 删除 `runAsync` 和 `runTailAsync` 别名，统一使用 `run()` 和 `runTail()`

**理由**:
- 函数重载可以自动检测生成器类型
- 减少 API 表面，避免混淆
- TypeScript 类型推断更好

**影响**: 破坏性变更，但在 v0.1.x 阶段可以接受

### 2026-02-26: OIDC 自动发布配置

**决策**: 使用 GitHub Actions OIDC 自动发布到 npm

**配置**:
- 删除 `npm whoami` 检查步骤
- 删除 `--access public` 参数
- Node.js 版本：24

**理由**: 与 DynaPM 项目保持一致，简化发布流程

### 2026-02-26: 测试覆盖完整性

**决策**: 添加异步递归测试，覆盖所有递归模式

**成果**: 从 19 个测试增加到 26 个测试

**测试组**:
- 同步递归：run, runTail, 特殊递归形式
- 异步递归：run (async), runTail (async)

### 2026-02-26: 文档国际化

**决策**: 同时维护中英文 README，双向链接

**配置**:
- README.md（英文主文档）
- README_zh.md（中文完整翻译）
- package.json `files` 包含两个 README

### 2026-02-26: 删除 examples 目录

**决策**: 删除 examples/ 目录，所有示例在 README 中

**理由**:
- 示例在 README 中更易维护
- 单一数据源，避免不同步
- 用户直接在 npm/GitHub 看到 README

---

## 快速参考

### 常用命令

```bash
# 开发
npm run build          # 构建
npm test              # 运行所有测试
npm run build && npm test  # 构建并测试

# 发布
npm version patch     # 补丁版本
npm version minor     # 次版本
npm version major     # 主版本
git push origin main --tags  # 推送所有标签

# 检查
npm view recurun version  # 查看 npm 版本
npm test 2>&1 | grep "pass\|fail"  # 快速查看测试结果
```

### 核心文件

| 文件 | 用途 | 修改频率 |
|------|------|----------|
| `src/index.ts` | 核心实现 | 低（API 稳定） |
| `test/test.ts` | 测试用例 | 中（添加新模式） |
| `README.md` | 英文文档 | 高（功能更新） |
| `README_zh.md` | 中文文档 | 高（功能更新） |
| `package.json` | 包配置 | 低（版本号） |

---

**最后维护**: 2026-02-26
**维护者**: RecuRun Team
**许可证**: MIT
