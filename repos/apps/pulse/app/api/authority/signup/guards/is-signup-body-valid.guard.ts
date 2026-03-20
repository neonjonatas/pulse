import { signupSchema } from '@signup/ui'
import type { SignupBody } from '@api/authority/signup/signup.types'

export function isSignupBodyValid(body: unknown): SignupBody {
  const parsed = signupSchema.parse(body)

  return parsed
}
