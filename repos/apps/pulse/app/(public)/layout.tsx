import { redirect } from 'next/navigation'

import { isAuthenticated as isAuthTemp } from '@state'

interface PublicLayoutProps {
  children: React.ReactNode
}

export default function PublicLayout(props: PublicLayoutProps) {
  const { children } = props

  const isAuthenticated = isAuthTemp // TODO: replace with server validation

  if (isAuthenticated) {
    redirect('/')
  }

  return children
}
