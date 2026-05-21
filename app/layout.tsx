import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { InstallPrompt } from '@/components/install-prompt'
import { LayoutShell } from '@/components/layout-shell'
import { LanguageProvider } from '@/lib/language-context'

const inter = Inter({ subsets: ['latin'] })

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
  themeColor: '#6366f1',
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
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className={`${inter.className} min-h-screen`}>
        <LanguageProvider>
          <LayoutShell>
            {children}
          </LayoutShell>
          <InstallPrompt />
        </LanguageProvider>
      </body>
    </html>
  )
}
