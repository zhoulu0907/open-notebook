// frontend/src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  locales: ['en-US', 'zh-CN'],
  defaultLocale: 'en-US',
  localePrefix: 'as-needed' // 英文不显示前缀，中文显示 /zh-CN
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
