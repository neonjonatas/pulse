import { Metadata } from 'next'

import { description, robots } from '@state'
import { LoginForm } from '@login/ui'

export const metadata: Metadata = {
  title: 'Pulse - Login',
  description,
  robots
}

export default function LoginPage() {
  return <LoginForm />
}
