import { Provider as JotaiProvider } from 'jotai'
import { Geo, Iceland } from 'next/font/google'

import { cn } from '@lib/template'

import './globals.css'

const geo = Geo({
  subsets: ['latin'],
  weight: '400'
})

const iceland = Iceland({
  subsets: ['latin'],
  weight: '400'
})

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout(props: RootLayoutProps) {
  const { children } = props

  return (
    <html lang="en">
      <body className={cn(geo.className, iceland.className)}>
        <JotaiProvider>{children}</JotaiProvider>
      </body>
    </html>
  )
}
