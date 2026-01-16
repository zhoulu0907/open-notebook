import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default function RootLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  // 确保 locale 有效
  params.then(({ locale }) => {
    if (!routing.locales.includes(locale as any)) {
      notFound()
    }
  })

  return children
}
