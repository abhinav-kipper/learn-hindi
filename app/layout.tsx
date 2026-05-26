import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Nunito, Mochiy_Pop_One, Caveat } from 'next/font/google'
import './globals.css'
import '@/components/design/animations.css'
import '@/components/design/cutting-animations.css'
import { InstallPrompt } from '@/components/install-prompt'
import { LayoutShell } from '@/components/layout-shell'
import { LanguageProvider } from '@/lib/language-context'
import { ChainaProvider, COLORS } from '@/components/design'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  weight: ['500', '700', '800'],
})
const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '600', '700', '800', '900'],
})
const mochiy = Mochiy_Pop_One({
  subsets: ['latin'],
  variable: '--font-mochiy',
  weight: '400',
})
const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  weight: ['500', '700'],
})

export const metadata: Metadata = {
  title: 'Bolna Seekho',
  description: 'Learn conversational Hindi the natural way',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bolna Seekho',
  },
}

export const viewport: Viewport = {
  themeColor: COLORS.lav,
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body
        className={`${bricolage.variable} ${nunito.variable} ${mochiy.variable} ${caveat.variable} min-h-screen`}
      >
        <LanguageProvider>
          <ChainaProvider>
            <LayoutShell>{children}</LayoutShell>
            <InstallPrompt />
          </ChainaProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
