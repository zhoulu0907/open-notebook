# 中文国际化 (i18n) 设计文档

**创建日期：** 2026-01-16
**状态：** 已批准
**技术方案：** next-intl

---

## 概述

为 Open Notebook 添加中文国际化支持，实现中英文双语界面切换功能。

### 目标

- 支持英文 (en) 和简体中文 (zh-CN)
- 用户可在设置页面切换语言
- 语言偏好持久化存储
- 为未来扩展其他语言预留架构

### 约束

- MVP 优先：专注中英文支持
- 不降低现有性能
- 保持 TypeScript 类型安全
- 语言切换器仅放置在设置页面

---

## 架构设计

### 技术栈

- **框架：** next-intl (Next.js 官方推荐 i18n 方案)
- **路由：** App Router 动态路由 `[locale]`
- **存储：** localStorage 持久化语言偏好
- **检测：** Accept-Language 头 + 用户手动选择

### 文件结构

```
frontend/src/
├── i18n/
│   ├── config.ts           # 语言配置
│   ├── request.ts          # 请求配置
│   └── routing.ts          # 路由配置
├── messages/
│   ├── en.json             # 英文翻译
│   └── zh-CN.json          # 中文翻译
├── middleware.ts           # 语言检测中间件
└── components/
    └── settings/
        └── LanguageSwitcher.tsx  # 语言切换器
```

---

## 翻译文件结构

### 组织方式

按功能模块组织，使用嵌套命名空间：

```json
{
  "common": { "通用文本" },
  "notebooks": { "笔记本相关" },
  "sources": { "来源相关" },
  "chat": { "聊天相关" },
  "settings": { "设置相关" },
  "errors": { "错误消息" }
}
```

### 命名规范

- 小写字母
- 下划线分隔
- 按功能模块分组
- 使用嵌套结构

---

## 核心组件

### 1. 中间件

语言检测与路由重定向：

```typescript
import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['en', 'zh-CN'],
  defaultLocale: 'en',
  localeDetection: true
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
```

### 2. 语言切换器

位于设置页面，提供下拉选择：

```typescript
// 保存语言偏好到 localStorage
localStorage.setItem('preferred-locale', newLocale)

// 切换路由
router.replace(pathname, { locale: newLocale })
```

### 3. 组件使用方式

```typescript
import { useTranslations } from 'next-intl'

export default function Component() {
  const t = useTranslations('module')
  return <Button>{t('action')}</Button>
}
```

---

## 翻译策略

### 混合模式

| 类型 | 方式 | 内容 |
|------|------|------|
| AI 翻译 | 生成初稿 | 通用文本、按钮标签 |
| 人工审核 | 校对修正 | 专业术语、错误消息 |
| 人工翻译 | 完全人工 | 核心功能文本 |

### 术语表

| 英文 | 中文 |
|------|------|
| Notebook | 笔记本 |
| Source | 来源 |
| Chat | 对话 |
| Settings | 设置 |
| Delete | 删除 |
| Save | 保存 |

---

## 实施阶段

### 阶段 1：基础设施搭建 (4-6h)

- 安装 next-intl
- 创建 i18n 配置
- 配置中间件和路由
- 创建翻译文件模板

### 阶段 2：文本提取 (4-8h)

- 扫描所有 tsx 文件
- 提取硬编码文本
- 组织到 en.json
- 生成 zh-CN.json 模板

### 阶段 3：翻译工作 (16-24h)

- AI 翻译通用文本
- 人工审核专业术语
- 人工翻译核心文本
- 统一术语和风格

### 阶段 4：代码重构 (8-12h)

- 替换硬编码文本
- 使用 useTranslations Hook
- 按模块逐步推进

### 阶段 5：测试验证 (4-6h)

- 语言切换测试
- 翻译完整性检查
- 边界情况测试

---

## 质量保证

### 翻译缺失处理

- 显示键名而非崩溃
- 控制台记录缺失键
- 不影响页面渲染

### TypeScript 检查

- 编译时验证翻译键
- 100% 类型覆盖率

### ESLint 规则

- 禁止硬编码文本
- 强制使用翻译 Hook

---

## 验收标准

### 功能

- [x] 支持中英文切换
- [x] 语言偏好持久化
- [x] 所有界面文本已翻译
- [x] 错误消息显示中文

### 性能

- [x] 首次加载 < 2 秒
- [x] 语言切换 < 500ms
- [x] 包体积增加 < 100KB

### 质量

- [x] TypeScript 无类型错误
- [x] ESLint 无错误
- [x] 所有测试通过

---

## 风险与缓解

| 风险 | 缓解措施 |
|------|----------|
| 路由冲突 | 充分测试，准备回滚 |
| 翻译质量 | 混合模式，人工审核 |
| 性能影响 | 按需加载语言包 |

---

## 附录

### 翻译文件示例

详见需求文档 `docs/prd/i18n-chinese-support.md`

### 组件示例

```typescript
// notebooks 页面
import { useTranslations } from 'next-intl'

export default function NotebooksPage() {
  const t = useTranslations('notebooks')
  return <h1>{t('title')}</h1>
}
```

---

**变更历史：**

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| v1.0 | 2026-01-16 | 初始设计 |
