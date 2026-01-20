// LanguageSwitcher Component Tests
// Test-Driven Development: RED → GREEN cycle
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { locales, localeNames, type Locale } from '@/i18n/config'

// Unmock use-translation to test real implementation
vi.unmock('@/lib/hooks/use-translation')

// Set up mocks before importing the component
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}))

import { useTranslation as useI18nTranslation } from 'react-i18next'

// Import the component after mocks are configured
import { LanguageSwitcher } from './LanguageSwitcher'

describe('LanguageSwitcher', () => {
  const changeLanguageMock = vi.fn()
  const mockLocalStorage = {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    clear: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    global.localStorage = mockLocalStorage as any

    // Mock react-i18next with Proxy-compatible t function
    const mockT = new Proxy((key: string) => key, {
      get: (target, prop) => {
        if (prop === 'common') {
          return { language: 'Language' }
        }
        return (target as any)[prop]
      },
    })

    ;(useI18nTranslation as unknown as { mockReturnValue: (v: unknown) => void }).mockReturnValue({
      t: mockT,
      i18n: {
        language: 'en-US',
        changeLanguage: changeLanguageMock,
      },
    })
  })

  describe('Rendering', () => {
    it('should render the select component', () => {
      render(<LanguageSwitcher />)

      // Verify select trigger is rendered
      const selectTrigger = screen.getByRole('combobox')
      expect(selectTrigger).toBeInTheDocument()
    })

    it('should show current locale name in select trigger', () => {
      render(<LanguageSwitcher />)

      // The current locale name should be visible
      expect(screen.getByText('English')).toBeInTheDocument()
    })

    it('should show different locale when i18n language changes', () => {
      // Mock with different language
      const mockT = new Proxy((key: string) => key, {
        get: (target, prop) => {
          if (prop === 'common') {
            return { language: '語言' }
          }
          return (target as any)[prop]
        },
      })

      ;(useI18nTranslation as unknown as { mockReturnValue: (v: unknown) => void }).mockReturnValue({
        t: mockT,
        i18n: {
          language: 'zh-TW',
          changeLanguage: changeLanguageMock,
        },
      })

      render(<LanguageSwitcher />)

      expect(screen.getByText('中文 (繁體)')).toBeInTheDocument()
    })
  })

  describe('Language switching behavior', () => {
    it('should save to localStorage when language is changed', async () => {
      render(<LanguageSwitcher />)

      // Open the select dropdown
      const selectTrigger = screen.getByRole('combobox')
      fireEvent.click(selectTrigger)

      // Wait for dropdown to open and options to appear
      await waitFor(() => {
        expect(screen.getByText('中文 (简体)')).toBeInTheDocument()
      })

      // Click on zh-CN option
      fireEvent.click(screen.getByText('中文 (简体)'))

      // Verify localStorage was called
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('preferred-locale', 'zh-CN')
    })

    it('should call i18n.changeLanguage when selection changes', async () => {
      render(<LanguageSwitcher />)

      // Open the select dropdown
      const selectTrigger = screen.getByRole('combobox')
      fireEvent.click(selectTrigger)

      // Wait for options to appear
      await waitFor(() => {
        expect(screen.getByText('Português (Brasil)')).toBeInTheDocument()
      })

      // Click on pt-BR option
      fireEvent.click(screen.getByText('Português (Brasil)'))

      // Verify i18n.changeLanguage was called
      expect(changeLanguageMock).toHaveBeenCalledWith('pt-BR')
    })

    it('should handle multiple language changes', async () => {
      render(<LanguageSwitcher />)

      const selectTrigger = screen.getByRole('combobox')

      // First change to zh-CN
      fireEvent.click(selectTrigger)
      await waitFor(() => {
        expect(screen.getByText('中文 (简体)')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('中文 (简体)'))

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('preferred-locale', 'zh-CN')

      // Second change to pt-BR
      fireEvent.click(selectTrigger)
      await waitFor(() => {
        expect(screen.getByText('Português (Brasil)')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Português (Brasil)'))

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('preferred-locale', 'pt-BR')
    })
  })

  describe('Integration', () => {
    it('should render label with translation from Proxy API', () => {
      const { container } = render(<LanguageSwitcher />)

      // The label element should exist (even if text varies based on i18n)
      const label = container.querySelector('label')
      expect(label).toBeInTheDocument()

      // Label should have the correct class
      expect(label).toHaveClass('text-sm', 'font-medium')
    })

    it('should work with all supported locales', () => {
      // Test that the component can handle all configured locales
      expect(locales).toContain('en-US')
      expect(locales).toContain('zh-CN')
      expect(locales).toContain('zh-TW')
      expect(locales).toContain('pt-BR')

      // Verify locale names exist for all locales
      for (const locale of locales) {
        expect(localeNames[locale]).toBeDefined()
        expect(typeof localeNames[locale]).toBe('string')
      }
    })
  })
})
