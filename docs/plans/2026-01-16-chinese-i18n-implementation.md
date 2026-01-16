# 中文国际化 (i18n) 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 Open Notebook 添加中文国际化支持，实现中英文双语界面切换功能。

**Architecture:** 使用 next-intl 框架实现 Next.js App Router 的国际化。通过动态路由 `[locale]` 支持多语言，中间件处理语言检测，localStorage 持久化用户偏好。

**Tech Stack:** next-intl, Next.js 15.4.10, React 19, TypeScript 5

---

## 前置准备

### 开始前检查清单

- [ ] 确认在 `feature/i18n-chinese` 分支
- [ ] 确认网络代理已配置（如果需要）
- [ ] 确认 Node.js 版本 >= 18

```bash
# 验证当前分支
git branch --show-current

# 验证 Node.js 版本
node --version
```

---

## 阶段 1：基础设施搭建

### Task 1: 安装 next-intl 依赖

**Files:**
- Modify: `frontend/package.json`

**Step 1: 安装 next-intl**

```bash
cd frontend
npm install next-intl
```

**Step 2: 验证安装**

检查 `package.json` 中是否包含 `next-intl`：

```bash
grep "next-intl" package.json
```

预期输出: `"next-intl": "^3.x.x"`

**Step 3: 提交**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "feat(i18n): install next-intl dependency"
```

---

### Task 2: 创建 i18n 配置文件

**Files:**
- Create: `frontend/src/i18n/config.ts`

**Step 1: 创建语言配置文件**

```typescript
// frontend/src/i18n/config.ts
export const locales = ['en', 'zh-CN'] as const
export const defaultLocale = 'en' as const
export type Locale = (typeof locales)[number]

// 语言显示名称
export const localeNames: Record<Locale, string> = {
  en: 'English',
  'zh-CN': '中文 (简体)'
}

// 语言图标/国旗（可选）
export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  'zh-CN': '🇨🇳'
}
```

**Step 2: 提交**

```bash
git add frontend/src/i18n/config.ts
git commit -m "feat(i18n): add language configuration"
```

---

### Task 3: 创建路由配置

**Files:**
- Create: `frontend/src/i18n/routing.ts`

**Step 1: 创建路由配置**

```typescript
// frontend/src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  locales: ['en', 'zh-CN'],
  defaultLocale: 'en',
  localePrefix: 'as-needed' // 英文不显示前缀，中文显示 /zh-CN
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
```

**Step 2: 提交**

```bash
git add frontend/src/i18n/routing.ts
git commit -m "feat(i18n): add routing configuration"
```

---

### Task 4: 创建请求配置

**Files:**
- Create: `frontend/src/i18n/request.ts`

**Step 1: 创建请求配置**

```typescript
// frontend/src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // 验证语言是否有效
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
})
```

**Step 2: 提交**

```bash
git add frontend/src/i18n/request.ts
git commit -m "feat(i18n): add request configuration"
```

---

### Task 5: 更新 Next.js 配置

**Files:**
- Modify: `frontend/next.config.ts`

**Step 1: 修改 next.config.ts**

在现有的 next.config.ts 中包装 next-intl 插件：

```typescript
// frontend/next.config.ts
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./frontend/src/i18n/request.ts')

const nextConfig: NextConfig = {
  /* 保持现有配置不变 */
}

export default withNextIntl(nextConfig)
```

如果 next.config.ts 的结构不同，请适配现有配置。

**Step 2: 验证配置**

```bash
cd frontend
npm run build  # 验证配置是否正确
```

**Step 3: 提交**

```bash
git add frontend/next.config.ts
git commit -m "feat(i18n): integrate next-intl with Next.js config"
```

---

### Task 6: 创建中间件

**Files:**
- Create: `frontend/src/middleware.ts`

**Step 1: 创建中间件文件**

```typescript
// frontend/src/middleware.ts
import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['en', 'zh-CN'],
  defaultLocale: 'en',
  localeDetection: true
})

export const config = {
  // 匹配所有路径，排除 API、_next、静态文件等
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
```

**Step 2: 提交**

```bash
git add frontend/src/middleware.ts
git commit -m "feat(i18n): add middleware for locale detection"
```

---

### Task 7: 创建翻译文件结构

**Files:**
- Create: `frontend/src/messages/en.json`
- Create: `frontend/src/messages/zh-CN.json`

**Step 1: 创建英文翻译文件（基础结构）**

```json
// frontend/src/messages/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "search": "Search...",
    "loading": "Loading...",
    "confirm": "Confirm",
    "back": "Back",
    "close": "Close",
    "submit": "Submit",
    "yes": "Yes",
    "no": "No"
  },
  "notebooks": {
    "title": "Notebooks",
    "new": "New Notebook",
    "searchPlaceholder": "Search notebooks...",
    "empty": "No notebooks found",
    "active": "Active",
    "archived": "Archived",
    "deleteConfirm": "Are you sure you want to delete this notebook?",
    "deleteSuccess": "Notebook deleted successfully",
    "createSuccess": "Notebook created successfully"
  },
  "sources": {
    "title": "Sources",
    "add": "Add Source",
    "upload": "Upload File",
    "url": "URL",
    "paste": "Paste Text",
    "processing": "Processing...",
    "uploadSuccess": "Source uploaded successfully",
    "uploadError": "Failed to upload source"
  },
  "chat": {
    "send": "Send",
    "placeholder": "Ask a question...",
    "thinking": "AI is thinking...",
    "regenerate": "Regenerate",
    "copy": "Copy",
    "copied": "Copied!"
  },
  "settings": {
    "title": "Settings",
    "language": "Language",
    "theme": "Theme",
    "appearance": "Appearance",
    "saved": "Settings saved successfully"
  },
  "errors": {
    "network": "Network error. Please check your connection.",
    "unauthorized": "Unauthorized. Please log in.",
    "required": "This field is required.",
    "invalidEmail": "Please enter a valid email address.",
    "generic": "Something went wrong. Please try again."
  }
}
```

**Step 2: 创建中文翻译文件**

```json
// frontend/src/messages/zh-CN.json
{
  "common": {
    "save": "保存",
    "cancel": "取消",
    "delete": "删除",
    "edit": "编辑",
    "search": "搜索...",
    "loading": "加载中...",
    "confirm": "确认",
    "back": "返回",
    "close": "关闭",
    "submit": "提交",
    "yes": "是",
    "no": "否"
  },
  "notebooks": {
    "title": "笔记本",
    "new": "新建笔记本",
    "searchPlaceholder": "搜索笔记本...",
    "empty": "未找到笔记本",
    "active": "活跃",
    "archived": "已归档",
    "deleteConfirm": "确定要删除这个笔记本吗？",
    "deleteSuccess": "笔记本删除成功",
    "createSuccess": "笔记本创建成功"
  },
  "sources": {
    "title": "来源",
    "add": "添加来源",
    "upload": "上传文件",
    "url": "链接",
    "paste": "粘贴文本",
    "processing": "处理中...",
    "uploadSuccess": "来源上传成功",
    "uploadError": "上传来源失败"
  },
  "chat": {
    "send": "发送",
    "placeholder": "请输入问题...",
    "thinking": "AI 正在思考...",
    "regenerate": "重新生成",
    "copy": "复制",
    "copied": "已复制！"
  },
  "settings": {
    "title": "设置",
    "language": "语言",
    "theme": "主题",
    "appearance": "外观",
    "saved": "设置保存成功"
  },
  "errors": {
    "network": "网络错误，请检查您的连接。",
    "unauthorized": "未授权，请重新登录。",
    "required": "此字段为必填项。",
    "invalidEmail": "请输入有效的邮箱地址。",
    "generic": "出错了，请重试。"
  }
}
```

**Step 3: 提交**

```bash
git add frontend/src/messages/
git commit -m "feat(i18n): add initial translation files for en and zh-CN"
```

---

### Task 8: 更新根布局以支持 i18n

**Files:**
- Modify: `frontend/src/app/layout.tsx`

**Step 1: 修改根布局**

需要将现有的 layout.tsx 包装以支持 i18n。具体修改取决于当前结构：

```typescript
// frontend/src/app/layout.tsx
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // 验证语言是否有效
  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  // 获取翻译消息
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
```

注意：根据实际的项目结构调整，可能需要保留现有的 provider 和样式。

**Step 2: 提交**

```bash
git add frontend/src/app/layout.tsx
git commit -m "feat(i18n): update root layout for i18n support"
```

---

## 阶段 2：语言切换器组件

### Task 9: 创建语言切换器组件

**Files:**
- Create: `frontend/src/components/settings/LanguageSwitcher.tsx`

**Step 1: 创建语言切换器组件**

```typescript
// frontend/src/components/settings/LanguageSwitcher.tsx
'use client'

import { useRouter, usePathname } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import { locales, localeNames, type Locale } from '@/i18n/config'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

export function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  const handleLanguageChange = (newLocale: Locale) => {
    // 持久化到 localStorage
    localStorage.setItem('preferred-locale', newLocale)

    // 切换路由但不改变路径
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Language / 语言
      </label>
      <Select value={locale} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {locales.map((loc) => (
            <SelectItem key={loc} value={loc}>
              {localeNames[loc]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
```

**Step 2: 提交**

```bash
git add frontend/src/components/settings/LanguageSwitcher.tsx
git commit -m "feat(i18n): add language switcher component"
```

---

### Task 10: 集成语言切换器到设置页面

**Files:**
- Modify: `frontend/src/app/(dashboard)/settings/page.tsx`

**Step 1: 在设置页面添加语言切换器**

```typescript
// frontend/src/app/(dashboard)/settings/page.tsx
import { LanguageSwitcher } from '@/components/settings/LanguageSwitcher'
import { useTranslations } from 'next-intl'

export default function SettingsPage() {
  const t = useTranslations('settings')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t('appearance')}</h2>

        {/* 语言切换器 */}
        <LanguageSwitcher />

        {/* 其他设置项保持不变 */}
      </div>
    </div>
  )
}
```

**Step 2: 提交**

```bash
git add frontend/src/app/(dashboard)/settings/page.tsx
git commit -m "feat(i18n): integrate language switcher into settings page"
```

---

## 阶段 3：文本提取与翻译

### Task 11: 创建文本提取脚本

**Files:**
- Create: `scripts/extract-i18n-texts.js`

**Step 1: 创建文本提取脚本**

这个脚本扫描所有 tsx 文件并提取需要翻译的文本：

```javascript
// scripts/extract-i18n-texts.js
const fs = require('fs')
const path = require('path')
const { glob } = require('glob')

// 正则表达式匹配常见需要翻译的文本模式
const patterns = [
  // JSX 文本内容
  />([^<>{}]+)</g,
  // 字符串属性值
  /=["']([^"']+)["']/g,
]

const frontendDir = path.join(__dirname, '../frontend/src')

async function extractTexts() {
  const files = await glob('**/*.tsx', { cwd: frontendDir })

  const extractedTexts = new Set()

  for (const file of files) {
    const content = fs.readFileSync(path.join(frontendDir, file), 'utf-8')

    // 排除已使用翻译的文件
    if (content.includes('useTranslations')) continue

    // 提取文本
    patterns.forEach(pattern => {
      const matches = content.matchAll(pattern)
      for (const match of matches) {
        const text = match[1]?.trim()
        if (text && text.length > 1 && !/^[{\w]+$/.test(text)) {
          extractedTexts.add(text)
        }
      }
    })
  }

  console.log(`Found ${extractedTexts.size} unique texts to translate`)
  console.log('Sample texts:', Array.from(extractedTexts).slice(0, 10))
}

extractTexts().catch(console.error)
```

**Step 2: 安装依赖**

```bash
npm install --save-dev glob
```

**Step 3: 运行脚本测试**

```bash
node scripts/extract-i18n-texts.js
```

**Step 4: 提交**

```bash
git add scripts/extract-i18n-texts.js package.json package-lock.json
git commit -m "feat(i18n): add text extraction script"
```

---

### Task 12: 手动提取核心页面文本

**Files:**
- Modify: `frontend/src/app/(dashboard)/notebooks/page.tsx`
- Modify: `frontend/src/app/(dashboard)/sources/page.tsx`

**Step 1: 重构 Notebooks 页面**

```typescript
// frontend/src/app/(dashboard)/notebooks/page.tsx
import { useTranslations } from 'next-intl'

export default function NotebooksPage() {
  const t = useTranslations('notebooks')

  return (
    <div>
      <h1>{t('title')}</h1>
      {/* 其他组件 */}
    </div>
  )
}
```

**Step 2: 提交**

```bash
git add frontend/src/app/(dashboard)/notebooks/page.tsx
git commit -m "feat(i18n): internationalize notebooks page"
```

---

## 阶段 4：测试与验证

### Task 13: 添加 i18n 单元测试

**Files:**
- Create: `frontend/src/__tests__/i18n.test.tsx`

**Step 1: 创建测试文件**

```typescript
// frontend/src/__tests__/i18n.test.tsx
import { render, screen } from '@testing-library/react'
import { LanguageSwitcher } from '@/components/settings/LanguageSwitcher'

describe('LanguageSwitcher', () => {
  it('renders language options', () => {
    render(<LanguageSwitcher />)

    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('中文 (简体)')).toBeInTheDocument()
  })
})
```

**Step 2: 提交**

```bash
git add frontend/src/__tests__/i18n.test.tsx
git commit -m "test(i18n): add unit tests for language switcher"
```

---

### Task 14: 手动测试

**Step 1: 启动开发服务器**

```bash
cd frontend
npm run dev
```

**Step 2: 测试清单**

- [ ] 访问首页，验证默认语言为英文
- [ ] 进入设置页面，验证语言切换器显示
- [ ] 切换到中文，验证界面文本变为中文
- [ ] 刷新页面，验证语言偏好保持
- [ ] 切换回英文，验证界面恢复英文
- [ ] 测试所有主要页面的翻译

**Step 3: 创建测试报告**

在 `docs/plans/2026-01-16-chinese-i18n-test-report.md` 中记录测试结果。

---

## 阶段 5：文档与发布

### Task 15: 更新用户文档

**Files:**
- Modify: `docs/user-guide/index.md`

**Step 1: 添加语言设置说明**

在用户文档中添加如何切换语言的说明。

**Step 2: 提交**

```bash
git add docs/user-guide/index.md
git commit -m "docs(i18n): add language switching documentation"
```

---

### Task 16: 创建 Pull Request

**Step 1: 推送到远程**

```bash
git push origin feature/i18n-chinese
```

**Step 2: 创建 Pull Request**

访问：`https://github.com/zhoulu0907/open-notebook/pull/new/feature/i18n-chinese`

**PR 描述模板：**

```markdown
## 功能概述
实现中文国际化支持，用户可以在设置页面切换中英文界面。

## 主要变更
- 安装并配置 next-intl
- 创建中英文翻译文件
- 添加语言切换器组件
- 重构核心页面以支持多语言

## 测试清单
- [ ] 语言切换功能正常
- [ ] 翻译显示正确
- [ ] 语言偏好持久化
- [ ] 无回归问题

## 截图
<!-- 添加切换前后的截图 -->

## 相关问题
关联需求文档: `docs/prd/i18n-chinese-support.md`
关联设计文档: `docs/plans/2026-01-16-chinese-i18n-design.md`
```

---

## 故障排查

### 常见问题

**问题 1: 翻译不显示**
- 检查 `messages/*.json` 文件路径是否正确
- 验证 `useTranslations` 的命名空间是否与 JSON 结构匹配

**问题 2: 语言切换不生效**
- 确认中间件配置正确
- 检查浏览器 localStorage 是否保存了语言偏好

**问题 3: TypeScript 类型错误**
- 确保 `i18n/request.ts` 正确导入了翻译文件
- 检查所有组件是否正确使用了 `useTranslations` Hook

---

## 下一步

完成 i18n 实施后，可以考虑：
1. 添加更多语言支持（日语、韩语等）
2. 实现翻译管理界面
3. 添加用户贡献翻译的功能
4. 优化语言包加载性能

---

**计划完成日期：** 预计 5-7 个工作日

**最后更新：** 2026-01-16
