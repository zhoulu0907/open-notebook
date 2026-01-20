import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { resources } from './locales'

let initPromise: Promise<void> | null = null

// Initialize i18n - safe to call multiple times
export async function ensureI18nInitialized() {
  if (!initPromise) {
    initPromise = i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources,
        fallbackLng: 'en-US',
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
        detection: {
          order: ['localStorage', 'navigator'],
          caches: ['localStorage'],
        },
      })
      .then(() => {
        console.log('✅ i18n initialized successfully')
      })
      .catch((error) => {
        console.error('❌ i18n initialization failed:', error)
      })
  }
  return initPromise
}

// Auto-initialize on module import (for non-React environments)
if (typeof window === 'undefined') {
  await ensureI18nInitialized()
}

export default i18n
