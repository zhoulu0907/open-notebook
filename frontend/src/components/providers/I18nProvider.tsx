'use client'

import React, { useEffect, useState } from 'react'
import { ensureI18nInitialized } from '@/lib/i18n'
import { LanguageLoadingOverlay } from '@/components/common/LanguageLoadingOverlay'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [i18nReady, setI18nReady] = useState(false)

  useEffect(() => {
    const initialize = async () => {
      try {
        // 等待 i18n 初始化完成
        await ensureI18nInitialized()
        setI18nReady(true)
        console.log('✅ I18nProvider: i18n ready')
      } catch (error) {
        console.error('❌ I18nProvider: initialization failed:', error)
        // 即使失败也继续渲染，避免阻塞整个应用
        setI18nReady(true)
      }
    }

    // 标记为已挂载并开始初始化
    setMounted(true)
    initialize()
  }, [])

  // 避免 hydration 不匹配 - 等待挂载和 i18n 就绪
  if (!mounted || !i18nReady) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>
  }

  return (
    <>
      <LanguageLoadingOverlay />
      {children}
    </>
  )
}
