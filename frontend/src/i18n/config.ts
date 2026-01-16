// frontend/src/i18n/config.ts
export const locales = ['en-US', 'zh-CN', 'zh-TW', 'pt-BR'] as const
export const defaultLocale = 'en-US' as const
export type Locale = (typeof locales)[number]

// 语言显示名称
export const localeNames: Record<Locale, string> = {
  'en-US': 'English',
  'zh-CN': '中文 (简体)',
  'zh-TW': '中文 (繁體)',
  'pt-BR': 'Português (Brasil)',
}

// 语言图标/国旗（可选）
export const localeFlags: Record<Locale, string> = {
  'en-US': '🇺🇸',
  'zh-CN': '🇨🇳',
  'zh-TW': '🇹🇼',
  'pt-BR': '🇧🇷',
}
