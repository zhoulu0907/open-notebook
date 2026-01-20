'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Languages } from 'lucide-react'
import { useTranslation } from '@/lib/hooks/use-translation'
import { Link, usePathname } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import { locales, localeNames, type Locale } from '@/i18n/config'

interface LanguageToggleProps {
  iconOnly?: boolean
}

export function LanguageToggle({ iconOnly = false }: LanguageToggleProps) {
  const { t, setLanguage } = useTranslation()
  const locale = useLocale() as Locale
  const pathname = usePathname()

  const handleLanguageChange = (newLocale: Locale) => {
    // Save to localStorage for react-i18next
    setLanguage(newLocale)
    // Navigation happens automatically through Link component
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={iconOnly ? "ghost" : "outline"}
          size={iconOnly ? "icon" : "default"}
          className={iconOnly ? "h-9 w-full sidebar-menu-item" : "w-full justify-start gap-2 sidebar-menu-item"}
        >
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          {!iconOnly && <span>{localeNames[locale]}</span>}
          <span className="sr-only">{t.common.language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            asChild
            className={locale === loc ? 'bg-accent' : ''}
          >
            <Link
              href={pathname}
              locale={loc}
              onClick={() => handleLanguageChange(loc)}
            >
              {localeNames[loc]}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
