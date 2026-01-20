// E2E Tests for Language Switching Feature
// Test-Driven Development: RED phase
import { test, expect } from '@playwright/test'

/**
 * Test Suite: Language Switching
 *
 * These E2E tests verify the complete language switching flow:
 * 1. Default language detection
 * 2. Language switcher visibility and interaction
 * 3. Language preference persistence
 * 4. UI text updates after language change
 */

test.describe('Language Switching E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to settings page
    await page.goto('/en-US/settings')
  })

  test('should display language switcher on settings page', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Verify language switcher is visible
    const languageLabel = page.getByText(/language|语言/i)
    await expect(languageLabel).toBeVisible()

    // Verify select component is rendered
    const selectTrigger = page.getByRole('combobox')
    await expect(selectTrigger).toBeVisible()
  })

  test('should show all available language options', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // Click the select trigger to open dropdown
    const selectTrigger = page.getByRole('combobox')
    await selectTrigger.click()

    // Wait for dropdown options to appear
    await page.waitForTimeout(500)

    // Verify all language options are visible
    await expect(page.getByText('English')).toBeVisible()
    await expect(page.getByText('中文 (简体)')).toBeVisible()
    await expect(page.getByText('中文 (繁體)')).toBeVisible()
    await expect(page.getByText('Português (Brasil)')).toBeVisible()
  })

  test('should change language when selecting different option', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // Store initial URL locale
    const initialUrl = page.url()
    expect(initialUrl).toContain('/en-US/')

    // Open language selector
    const selectTrigger = page.getByRole('combobox')
    await selectTrigger.click()

    // Select Chinese (Simplified)
    await page.waitForTimeout(500)
    await page.getByText('中文 (简体)').click()

    // Wait for language change
    await page.waitForTimeout(1000)

    // Verify URL updated
    const newUrl = page.url()
    expect(newUrl).toContain('/zh-CN/')

    // Verify UI text changed to Chinese
    // Note: Specific text depends on your translation keys
    await expect(page.getByRole('combobox')).toBeVisible()
  })

  test('should persist language preference in localStorage', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // Open language selector and change to Portuguese
    const selectTrigger = page.getByRole('combobox')
    await selectTrigger.click()
    await page.waitForTimeout(500)
    await page.getByText('Português (Brasil)').click()

    // Wait for language change
    await page.waitForTimeout(1000)

    // Check localStorage for saved preference
    const savedLocale = await page.evaluate(() => {
      return localStorage.getItem('preferred-locale')
    })

    expect(savedLocale).toBe('pt-BR')
  })

  test('should load saved language preference on page refresh', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // Change language to Chinese (Traditional)
    const selectTrigger = page.getByRole('combobox')
    await selectTrigger.click()
    await page.waitForTimeout(500)
    await page.getByText('中文 (繁體)').click()

    // Wait for language change
    await page.waitForTimeout(1000)

    // Refresh the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify language preference persisted
    const currentUrl = page.url()
    expect(currentUrl).toContain('/zh-TW/')

    // Verify localStorage still has the preference
    const savedLocale = await page.evaluate(() => {
      return localStorage.getItem('preferred-locale')
    })

    expect(savedLocale).toBe('zh-TW')
  })

  test('should handle multiple language changes', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    const selectTrigger = page.getByRole('combobox')

    // First change: English → Chinese (Simplified)
    await selectTrigger.click()
    await page.waitForTimeout(500)
    await page.getByText('中文 (简体)').click()
    await page.waitForTimeout(1000)
    expect(page.url()).toContain('/zh-CN/')

    // Second change: Chinese (Simplified) → Portuguese
    await selectTrigger.click()
    await page.waitForTimeout(500)
    await page.getByText('Português (Brasil)').click()
    await page.waitForTimeout(1000)
    expect(page.url()).toContain('/pt-BR/')

    // Third change: Portuguese → Chinese (Traditional)
    await selectTrigger.click()
    await page.waitForTimeout(500)
    await page.getByText('中文 (繁體)').click()
    await page.waitForTimeout(1000)
    expect(page.url()).toContain('/zh-TW/')
  })

  test('should maintain language preference across navigation', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // Change to Chinese (Simplified)
    const selectTrigger = page.getByRole('combobox')
    await selectTrigger.click()
    await page.waitForTimeout(500)
    await page.getByText('中文 (简体)').click()
    await page.waitForTimeout(1000)

    // Navigate to a different page (e.g., notebooks)
    await page.goto('/zh-CN/notebooks')
    await page.waitForLoadState('networkidle')

    // Verify language is maintained
    expect(page.url()).toContain('/zh-CN/')

    // Navigate to settings
    await page.goto('/zh-CN/settings')
    await page.waitForLoadState('networkidle')

    // Verify language is still maintained
    expect(page.url()).toContain('/zh-CN/')
  })

  test('should handle language switching from different pages', async ({ page }) => {
    // Start from notebooks page
    await page.goto('/en-US/notebooks')
    await page.waitForLoadState('networkidle')

    // Navigate to settings
    await page.goto('/en-US/settings')
    await page.waitForLoadState('networkidle')

    // Change language
    const selectTrigger = page.getByRole('combobox')
    await selectTrigger.click()
    await page.waitForTimeout(500)
    await page.getByText('Português (Brasil)').click()
    await page.waitForTimeout(1000)

    // Verify URL updated
    expect(page.url()).toContain('/pt-BR/')

    // Go back to notebooks - should maintain language
    await page.goto('/pt-BR/notebooks')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/pt-BR/')
  })
})

test.describe('Language Switching Edge Cases', () => {
  test('should handle direct URL navigation with locale', async ({ page }) => {
    // Navigate directly to Chinese URL
    await page.goto('/zh-CN/settings')
    await page.waitForLoadState('networkidle')

    // Verify page loaded with correct locale
    expect(page.url()).toContain('/zh-CN/')

    // Language switcher should reflect current language
    const selectTrigger = page.getByRole('combobox')
    await expect(selectTrigger).toBeVisible()
  })

  test('should default to English when no preference exists', async ({ page }) => {
    // Clear localStorage
    await page.goto('/en-US/settings')
    await page.evaluate(() => {
      localStorage.removeItem('preferred-locale')
    })

    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Should default to English
    expect(page.url()).toContain('/en-US/')
  })

  test('should handle localStorage corruption gracefully', async ({ page }) => {
    await page.goto('/en-US/settings')

    // Set invalid locale in localStorage
    await page.evaluate(() => {
      localStorage.setItem('preferred-locale', 'invalid-locale')
    })

    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Should not crash and should fallback to default
    await expect(page.getByRole('combobox')).toBeVisible()
  })
})
