import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chai Galli — Component Gallery',
}

export default function DevLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
