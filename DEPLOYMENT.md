# RecuRun npm 发布指南

## 📦 通过 OIDC 发布到 npm

RecuRun 使用 GitHub Actions 和 OIDC（OpenID Connect）自动发布到 npm，无需手动管理 NPM_TOKEN。

### 前置条件

1. **GitHub 仓库配置**
   - 确保代码已推送到 GitHub 仓库
   - 仓库需要是公开的（或私有但可访问）

2. **npm 账号配置**
   - 注册 [npm 账号](https://www.npmjs.com/signup)
   - 创建 npm access token（用于首次配置）
   - 在 npm 上设置组织/包名

### 首次配置步骤

#### 1. 在 npm 上创建包

访问 https://www.npmjs.com/ 并确保：
- 你的包名 `recurun` 尚未被占用
- 如果被占用，可以在 package.json 中改为作用域包名如 `@your-org/recurun`

#### 2. 配置 GitHub Actions OIDC

**方式一：通过 npm CLI 配置（推荐）**

在本地运行：

```bash
# 安装 npm（如未安装）
npm install -g npm@latest

# 登录 npm
npm login

# 配置 GitHub Actions OIDC
npm token create --publish-only
```

然后访问 https://www.npmjs.com/settings/your-username/tokens 创建 token。

**方式二：通过 npm 网站配置**

1. 访问 https://www.npmjs.com/settings/your-username/tokens
2. 点击 "Create New Token"
3. 选择 "Automation" 类型
4. 复制 token

**重要：将 token 添加到 GitHub Secrets**

1. 进入 GitHub 仓库设置
2. Settings → Secrets and variables → Actions
3. 添加新的 secret：
   - Name: `NPM_TOKEN`
   - Value: 刚才创建的 token

#### 3. 配置 package.json

确保 `package.json` 配置正确：

```json
{
  "name": "recurun",  // 或 @your-org/recurun
  "publishConfig": {
    "access": "public",
    "provenance": true
  }
}
```

**注意事项：**
- `access: "public"` - 公开包必须设置
- `provenance: true` - 启用包溯源签名（推荐）

### 发布流程

#### 自动发布（推荐）

创建并推送版本标签：

```bash
# 1. 更新版本号
npm version patch  # 或 minor, major

# 2. 提交并推送
git add .
git commit -m "chore: release v0.1.1"
git push origin main

# 3. 推送标签（触发 GitHub Actions）
git push origin v0.1.1
```

GitHub Actions 会自动：
1. 构建项目
2. 运行测试
3. 发布到 npm（带签名）
4. 创建 GitHub Release

#### 手动发布（本地）

```bash
# 1. 构建
npm run build

# 2. 测试
npm test

# 3. 发布（首次需要登录）
npm login
npm publish --provenance
```

### 验证发布

发布成功后：

1. 访问 npm 包页面：
   ```
   https://www.npmjs.com/package/recurun
   ```

2. 检查包签名：
   ```bash
   npm view recurun
   npm audit recurun
   ```

3. 安装测试：
   ```bash
   mkdir test-recurun
   cd test-recurun
   npm init -y
   npm install recurun
   ```

### 版本管理

使用语义化版本：

```bash
# 补丁版本（bug 修复）：0.1.0 → 0.1.1
npm version patch

# 次版本（新功能）：0.1.0 → 0.2.0
npm version minor

# 主版本（破坏性更改）：0.1.0 → 1.0.0
npm version major
```

### 常见问题

**Q: 发布失败提示 "403 Forbidden"**
- 检查 NPM_TOKEN 是否正确
- 确认包名未被占用
- 如果是作用域包，确保设置为 public

**Q: OIDC 配置失败**
- 确保 GitHub Actions 有 `id-token: write` 权限
- 检查 npm 组织设置中启用了 OIDC

**Q: 包名已被占用**
- 在 package.json 中改为作用域包名：
  ```json
  {
    "name": "@your-username/recurun"
  }
  ```
- 在 npm 上创建组织

### 安全最佳实践

1. ✅ 启用 `--provenance` 包签名
2. ✅ 使用 OIDC 而非静态 token
3. ✅ 在 CI/CD 中运行测试
4. ✅ 定期更新依赖
5. ✅ 使用 `npm audit` 检查漏洞

### 参考资源

- [npm OIDC 文档](https://docs.npmjs.com/generating-provenance-statements)
- [GitHub Actions OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-npm)
- [语义化版本](https://semver.org/lang/zh-CN/)
