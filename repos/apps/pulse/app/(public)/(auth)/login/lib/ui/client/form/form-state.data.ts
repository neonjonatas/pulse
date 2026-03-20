import { LoginState, loginStateData } from '@login/state'

import { LoginFormState } from './form.types'

export const loginFormState: LoginFormState & LoginState = {
  ...loginStateData,
  apiError: null,
  fieldErrors: {},
  isPending: false,
  hasInteractedWithEmail: false,
  hasInteractedWithPassword: false
}
