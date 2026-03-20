import Link from 'next/link'

import { Logo } from '@lib/ui'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout(props: AuthLayoutProps) {
  const { children } = props

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center">
          <Logo width="60" height="60" noLabel />
        </Link>
        {children}
      </div>
    </div>
  )
}
