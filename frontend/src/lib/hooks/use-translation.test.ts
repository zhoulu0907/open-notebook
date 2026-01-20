import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
// Ensure we are testing the real implementation
vi.unmock('@/lib/hooks/use-translation')
import { useTranslation } from './use-translation'
import { useTranslation as useI18nTranslation } from 'react-i18next'
import { locales, type Locale } from '@/i18n/config'

// Mock react-i18next is already done in setup.ts,
// but we might need to control it per test
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn()
}))

describe('useTranslation Hook', () => {
  const changeLanguageMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
      length: 0,
      key: vi.fn(),
    } as Storage
  })

  describe('Proxy API', () => {
    beforeEach(() => {
      ;(useI18nTranslation as unknown as { mockReturnValue: (v: unknown) => void }).mockReturnValue({
        t: (key: string) => {
          if (key === 'common') return { appName: 'Open Notebook' }
          if (key === 'common.appName') return 'Open Notebook'
          return key
        },
        i18n: {
          language: 'en-US',
          changeLanguage: changeLanguageMock,
        },
      })
    })

    it('should return initial translations via proxy', () => {
      const { result } = renderHook(() => useTranslation())
      expect(result.current.language).toBe('en-US')
      // Test the proxy behavior t.common.appName -> t("common.appName")
      expect(result.current.t.common.appName).toBe('Open Notebook')
    })

    it('should allow changing language via setLanguage', () => {
      const { result } = renderHook(() => useTranslation())

      act(() => {
        result.current.setLanguage('zh-CN')
      })

      expect(changeLanguageMock).toHaveBeenCalledWith('zh-CN')
    })
  })

  describe('localStorage persistence', () => {
    it('should read saved locale from localStorage on mount', () => {
      // Mock localStorage to return a saved locale
      const mockLocalStorage = global.localStorage as any
      mockLocalStorage.getItem.mockReturnValue('zh-CN')

      ;(useI18nTranslation as unknown as { mockReturnValue: (v: unknown) => void }).mockReturnValue({
        t: (key: string) => key,
        i18n: {
          language: 'zh-CN',
          changeLanguage: changeLanguageMock,
        },
      })

      renderHook(() => useTranslation())

      // Verify localStorage was read
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('preferred-locale')
    })

    it('should call i18n.changeLanguage with saved locale', () => {
      const mockLocalStorage = global.localStorage as any
      mockLocalStorage.getItem.mockReturnValue('pt-BR')

      ;(useI18nTranslation as unknown as { mockReturnValue: (v: unknown) => void }).mockReturnValue({
        t: (key: string) => key,
        i18n: {
          language: 'pt-BR',
          changeLanguage: changeLanguageMock,
        },
      })

      renderHook(() => useTranslation())

      // Verify changeLanguage was called with saved locale
      expect(changeLanguageMock).toHaveBeenCalledWith('pt-BR')
    })

    it('should not change language if saved locale is invalid', () => {
      const mockLocalStorage = global.localStorage as any
      mockLocalStorage.getItem.mockReturnValue('invalid-locale')

      ;(useI18nTranslation as unknown as { mockReturnValue: (v: unknown) => void }).mockReturnValue({
        t: (key: string) => key,
        i18n: {
          language: 'en-US',
          changeLanguage: changeLanguageMock,
        },
      })

      renderHook(() => useTranslation())

      // Verify changeLanguage was NOT called for invalid locale
      expect(changeLanguageMock).not.toHaveBeenCalled()
    })

    it('should handle missing localStorage gracefully', () => {
      // Mock localStorage.getItem to return null (no saved preference)
      const mockLocalStorage = global.localStorage as any
      mockLocalStorage.getItem.mockReturnValue(null)

      ;(useI18nTranslation as unknown as { mockReturnValue: (v: unknown) => void }).mockReturnValue({
        t: (key: string) => key,
        i18n: {
          language: 'en-US',
          changeLanguage: changeLanguageMock,
        },
      })

      // Should not throw
      expect(() => {
        renderHook(() => useTranslation())
      }).not.toThrow()
    })

    it('should work with all supported locales from localStorage', () => {
      for (const locale of locales) {
        const mockLocalStorage = global.localStorage as any
        mockLocalStorage.getItem.mockReturnValue(locale)

        ;(useI18nTranslation as unknown as { mockReturnValue: (v: unknown) => void }).mockReturnValue({
          t: (key: string) => key,
          i18n: {
            language: locale,
            changeLanguage: changeLanguageMock,
          },
        })

        renderHook(() => useTranslation())

        expect(changeLanguageMock).toHaveBeenCalledWith(locale)
      }
    })
  })
})
