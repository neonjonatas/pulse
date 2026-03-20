import { signupStateData } from '@signup/state'

import type { SignupFormState } from './form.types'

export const signupFormState: SignupFormState = {
  ...signupStateData,
  apiError: null,
  fieldErrors: {},
  isPending: false,
  hasInteractedWithName: false,
  hasInteractedWithEmail: false,
  hasInteractedWithPassword: false
}
