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
    const locale = newLocale as Locale
    localStorage.setItem('preferred-locale', locale)
    i18n.changeLanguage(locale)
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
