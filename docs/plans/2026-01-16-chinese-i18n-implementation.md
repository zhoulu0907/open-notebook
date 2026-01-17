# 中文国际化 (i18n) 实施计划（更新版）

> **更新日期：** 2026-01-17  
> **基于项目实际状态调整**

---

## 项目当前状态

| 组件 | 状态 | 说明 |
|------|------|------|
| next-intl 依赖 | ✅ 已安装 | v4.7.0 |
| i18n 配置文件 | ✅ 已存在 | config.ts, routing.ts, request.ts |
| 中间件 | ✅ 已存在 | middleware.ts |
| 翻译文件 | ✅ 已存在 | en-US.json (946条), zh-CN.json (946条) |
| 路由结构 | ✅ 已存在 | `[locale]` 动态路由 |
| 自定义翻译 hook | ✅ 已存在 | `useTranslation.ts` 使用 react-i18next + Proxy |
| LanguageSwitcher | ❌ 待创建 | |
| localStorage 持久化 | ❌ 待实现 | |
| 设置页面集成 | ⚠️ 需补充 | 需添加语言切换器 |

---

## 待完成任务

### Task 1: 创建 LanguageSwitcher 组件

**Files:**
- Create: `frontend/src/components/settings/LanguageSwitcher.tsx`

```typescript
// frontend/src/components/settings/LanguageSwitcher.tsx
'use client'

import { locales, localeNames, type Locale } from '@/i18n/config'
import { useTranslation } from '@/lib/hooks/use-translation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()

  const handleLanguageChange = (newLocale: string) => {
    // 持久化到 localStorage
    localStorage.setItem('preferred-locale', newLocale)
    // 切换语言
    i18n.changeLanguage(newLocale)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {t.common.language}
      </label>
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
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

### Task 2: 在设置页面集成语言切换器

**Files:**
- Modify: `frontend/src/app/[locale]/(dashboard)/settings/components/SettingsForm.tsx`

**Step 1: 添加语言切换到设置表单**

```typescript
// 在 SettingsForm.tsx 中导入并使用
import { LanguageSwitcher } from '@/components/settings/LanguageSwitcher'
import { useTranslation } from '@/lib/hooks/use-translation'

export function SettingsForm() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      {/* 语言设置 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t.common.language}</h2>
        <LanguageSwitcher />
      </div>

      {/* 其他设置保持不变 */}
    </div>
  )
}
```

**Step 2: 提交**

```bash
git add frontend/src/app/[locale]/(dashboard)/settings/components/SettingsForm.tsx
git commit -m "feat(i18n): integrate language switcher into settings"
```

---

### Task 3: 实现 localStorage 持久化

**Files:**
- Modify: `frontend/src/lib/hooks/use-translation.ts`

**Step 1: 添加启动时读取 localStorage 偏好**

```typescript
// 在 use-translation.ts 中
import { useEffect } from 'react'

// 添加：启动时读取语言偏好
useEffect(() => {
  const savedLocale = localStorage.getItem('preferred-locale')
  if (savedLocale && locales.includes(savedLocale as Locale)) {
    i18n.changeLanguage(savedLocale)
  }
}, [i18n])
```

**Step 2: 提交**

```bash
git add frontend/src/lib/hooks/use-translation.ts
git commit -m "feat(i18n): add localStorage persistence for language preference"
```

---

### Task 4: 验证基础设施

**Files:**
- Modify: `frontend/next.config.ts` (已配置)
- Modify: `frontend/src/middleware.ts` (已配置)

**Step 1: 验证 next-intl 集成**

```bash
cd frontend
npm run build  # 验证配置是否正确
```

**Step 2: 验证翻译文件结构**

```bash
# 验证两个翻译文件结构一致
cd frontend
node -e "
const en = require('./src/messages/en-US.json');
const zh = require('./src/messages/zh-CN.json');
const enKeys = JSON.stringify(en, null, 2);
const zhKeys = JSON.stringify(zh, null, 2);
console.log('en-US keys:', Object.keys(en).join(', '));
console.log('zh-CN keys:', Object.keys(zh).join(', '));
console.log('Keys match:', JSON.stringify(Object.keys(en).sort()) === JSON.stringify(Object.keys(zh).sort()));
"
```

**Step 3: 提交验证结果**

```bash
git commit -m "chore(i18n): verify infrastructure setup"
```

---

### Task 5: 手动测试

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

## 已跳过/简化的任务

以下设计文档中的任务因项目已有实现而跳过：

| 任务 | 原因 |
|------|------|
| 安装 next-intl | ✅ 已安装 v4.7.0 |
| 创建 i18n 配置文件 | ✅ 已存在 config.ts, routing.ts, request.ts |
| 创建中间件 | ✅ 已存在 middleware.ts |
| 创建翻译文件 | ✅ 已存在完整的 en-US.json 和 zh-CN.json |
| 更新 Next.js 配置 | ✅ 已集成 next-intl 插件 |
| 文本提取与翻译 | ✅ 946条翻译已完成 |

---

## 故障排查

### 常见问题

**问题 1: 翻译不显示**
- 检查 `messages/*.json` 文件路径是否正确
- 验证 `useTranslation` 的命名空间是否与 JSON 结构匹配

**问题 2: 语言切换不生效**
- 确认 localStorage 已保存语言偏好
- 检查浏览器控制台是否有错误

**问题 3: TypeScript 类型错误**
- 确保 `locales` 数组类型正确
- 检查所有组件是否正确使用了 `useTranslation` Hook

---

## 下一步

完成 i18n 实施后，可以考虑：
1. 添加更多语言支持（日语、韩语等）
2. 实现翻译管理界面
3. 添加用户贡献翻译的功能
4. 优化语言包加载性能

---

**预计完成时间：** 2-3 小时（主要为测试和验证）

**最后更新：** 2026-01-17
