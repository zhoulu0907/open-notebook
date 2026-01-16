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
