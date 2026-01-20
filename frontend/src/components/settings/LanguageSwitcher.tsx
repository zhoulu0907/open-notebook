'use client'

import { locales, localeNames, type Locale } from '@/i18n/config'
import { useTranslation } from '@/lib/hooks/use-translation'
import { useRouter, usePathname } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

export function LanguageSwitcher() {
  const { t } = useTranslation()
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  const handleLanguageChange = (newLocale: string) => {
    const loc = newLocale as Locale
    // Save to localStorage for react-i18next
    localStorage.setItem('preferred-locale', loc)
    // Navigate to new locale URL
    router.replace(pathname, { locale: loc })
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {t.common.language}
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
