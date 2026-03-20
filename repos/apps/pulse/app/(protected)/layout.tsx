import { redirect } from 'next/navigation'

import { isAuthenticated as isAuthTemp } from '@state'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export default function ProtectedLayout(props: ProtectedLayoutProps) {
  const { children } = props

  const isAuthenticated = isAuthTemp // TODO: replace with server validation

  if (!isAuthenticated) {
    redirect('/login')
  }

  return children
}
