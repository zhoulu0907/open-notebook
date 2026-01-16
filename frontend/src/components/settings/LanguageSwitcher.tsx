'use client'
import { useRouter, usePathname } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import { locales, localeNames, type Locale } from '@/i18n/config'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  const handleLanguageChange = (newLocale: Locale) => {
    localStorage.setItem('preferred-locale', newLocale)
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Language / 语言</label>
      <Select value={locale} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {locales.map((loc) => (
            <SelectItem key={loc} value={loc}>{localeNames[loc]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
