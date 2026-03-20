import { Metadata } from 'next'

import { description, robots } from '@state'
import { SignupForm } from '@signup/ui'

export const metadata: Metadata = {
  title: 'Pulse - Signup',
  description,
  robots
}

export default function SignupPage() {
  return <SignupForm />
}
