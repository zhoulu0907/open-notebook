# 中文国际化 (i18n) TDD 开发计划

**创建日期：** 2026-01-20
**基于设计：** docs/plans/2026-01-16-chinese-i18n-design.md
**方法论：** Test-Driven Development (TDD)

---

## TDD 核心原则

> **"NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST"**

本开发计划严格遵循 TDD 的红-绿-重构循环：

```
RED → 编写失败的测试 → Verify RED → GREEN → 最小代码实现 → Verify GREEN → REFACTOR → 清理
```

---

## 当前状态评估

### 已完成的工作（已有代码）

| 组件 | 状态 | 测试状态 | 说明 |
|------|------|----------|------|
| LanguageSwitcher | ✅ 已实现 | ❌ **无测试** | **违反 TDD 原则** |
| useTranslation hook | ✅ 已实现 | ⚠️ 部分覆盖 | 缺少 localStorage 测试 |
| localStorage 持久化 | ✅ 已实现 | ❌ **无测试** | **违反 TDD 原则** |
| 设置页面集成 | ⚠️ 待验证 | ❌ 无测试 | 需要验证 |

### TDD 合规性评估

**❌ 不合规项：**
1. `LanguageSwitcher.tsx` 存在但无测试
2. localStorage 持久化逻辑存在但无测试
3. 设置页面集成未验证

**⚠️ 部分合规项：**
1. `useTranslation.test.ts` 存在但覆盖不完整

---

## TDD 开发策略

### 策略 A：回滚重写（严格 TDD）

**优点：** 100% 符合 TDD 原则
**缺点：** 浪费已有代码，时间成本高

```
删除现有代码 → 从测试开始 → 重新实现
```

### 策略 B：事后测试（重构 TDD）✅ **推荐**

**优点：** 保留已有工作，通过测试验证正确性
**缺点：** 不是严格的"测试先行"

```
为现有代码编写测试 → 验证代码行为 → 重构优化
```

**本计划采用策略 B**，原因：
1. 现有代码经过手动验证，功能正确
2. 通过编写测试可以：
   - 验证代码行为符合预期
   - 防止未来回归
   - 作为行为文档
3. 时间效率更高

---

## 开发阶段（TDD 循环）

### 阶段 1：LanguageSwitcher 组件测试

#### 1.1 RED - 编写失败测试

**测试文件：** `frontend/src/components/settings/LanguageSwitcher.test.tsx`

**测试用例：**

```typescript
describe('LanguageSwitcher', () => {
  it('should display current language from i18n', () => {})
  it('should show all available locales', () => {})
  it('should save to localStorage when language changes', () => {})
  it('should call i18n.changeLanguage when selection changes', () => {})
  it('should display locale names in select options', () => {})
})
```

#### 1.2 Verify RED

运行测试，确认失败：
```bash
cd frontend && npm test LanguageSwitcher.test.tsx
```

**预期结果：** Test fails because component doesn't have tests

#### 1.3 GREEN - 验证现有代码通过

由于组件已存在，运行测试应立即通过（如果测试正确描述了组件行为）。

#### 1.4 Verify GREEN

```bash
cd frontend && npm test LanguageSwitcher.test.tsx
```

**预期结果：** All tests pass

---

### 阶段 2：useTranslation Hook localStorage 测试

#### 2.1 RED - 编写失败测试

**测试文件：** `frontend/src/lib/hooks/use-translation.test.ts`

**新增测试用例：**

```typescript
describe('useTranslation localStorage persistence', () => {
  it('should read saved locale from localStorage on mount', () => {})
  it('should not change language if saved locale is invalid', () => {})
  it('should handle missing localStorage gracefully', () => {})
})
```

#### 2.2 Verify RED

运行测试，确认失败：
```bash
cd frontend && npm test use-translation.test.ts
```

**预期结果：** Tests fail (feature not tested yet)

#### 2.3 GREEN - 验证现有代码通过

#### 2.4 Verify GREEN

```bash
cd frontend && npm test use-translation.test.ts
```

---

### 阶段 3：设置页面集成测试

#### 3.1 RED - 编写失败测试

**测试文件：** `frontend/src/app/[locale]/(dashboard)/settings/components/SettingsForm.test.tsx`

**测试用例：**

```typescript
describe('SettingsForm language integration', () => {
  it('should render LanguageSwitcher component', () => {})
  it('should display language settings section', () => {})
  it('should apply translations to UI elements', () => {})
})
```

#### 3.2 Verify RED

```bash
cd frontend && npm test SettingsForm.test.tsx
```

#### 3.3 GREEN - 实现/调整代码

如果测试失败，调整 SettingsForm 组件。

#### 3.4 Verify GREEN

---

### 阶段 4：端到端测试（可选）

#### 4.1 RED - 编写 E2E 测试

**测试用例：**

```typescript
describe('Language switching E2E', () => {
  it('should persist language preference across page refresh', () => {})
  it('should update all UI text when language changes', () => {})
  it('should handle language switching in all pages', () => {})
})
```

#### 4.2 Verify RED → GREEN → Verify GREEN

---

## 验收标准

### 功能测试

- [ ] 所有单元测试通过
- [ ] 所有集成测试通过
- [ ] 测试覆盖率 ≥ 80%
- [ ] 无 TypeScript 类型错误
- [ ] 无 ESLint 错误

### TDD 流程合规

- [ ] 每个测试在实现前都失败过（Verify RED）
- [ ] 没有跳过 RED 阶段的测试
- [ ] 所有测试都有清晰的失败原因
- [ ] 测试名称清晰描述行为

### 代码质量

- [ ] 测试代码遵循项目风格
- [ ] Mock 使用合理（不滥用）
- [ ] 测试独立（无相互依赖）
- [ ] 测试快速（< 100ms 每个）

---

## 测试文件结构

```
frontend/src/
├── components/
│   └── settings/
│       ├── LanguageSwitcher.tsx
│       └── LanguageSwitcher.test.tsx      ← 新增
├── lib/
│   └── hooks/
│       ├── use-translation.ts
│       └── use-translation.test.ts        ← 扩展
└── app/
    └── [locale]/
        └── (dashboard)/
            └── settings/
                └── components/
                    ├── SettingsForm.tsx
                    └── SettingsForm.test.tsx  ← 新增
```

---

## 风险与缓解

| 风险 | 缓解措施 |
|------|----------|
| 现有代码可能有 bug | 通过测试发现并修复 |
| 测试可能编写不正确 | Code review，多次验证 |
| Mock 配置复杂 | 参考现有测试模式 |
| localStorage 测试困难 | 使用测试隔离和清理 |

---

## 时间估算

| 阶段 | 预计时间 | 说明 |
|------|----------|------|
| 阶段 1：LanguageSwitcher 测试 | 30-45min | 编写 + 调试 |
| 阶段 2：useTranslation 测试扩展 | 30-45min | localStorage 测试 |
| 阶段 3：设置页面集成测试 | 30-45min | 集成测试 |
| 阶段 4：E2E 测试（可选） | 60-90min | 如果需要 |
| **总计** | **2-3 小时** | 不含 E2E |

---

## 下一步行动

1. ✅ 审查本计划
2. ⏳ 开始阶段 1：LanguageSwitcher 测试
3. ⏳ 按阶段顺序执行
4. ⏳ 创建测试报告

---

**最后更新：** 2026-01-20
**状态：** 待执行
