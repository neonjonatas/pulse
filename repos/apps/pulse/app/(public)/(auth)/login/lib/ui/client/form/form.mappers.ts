import type { FieldErrors } from '@infra/zod'

import type { LoginFormState, LoginSubmitMap } from './form.types'
import { LoginFormSchema } from './form.validation'
import { loginFormState } from './form-state.data'

export function mapLoginSubmit(map: LoginSubmitMap) {
  const { draft, isPending, fieldErrors } = map

  draft.fieldErrors.email = fieldErrors?.email
  draft.fieldErrors.password = fieldErrors?.password
  draft.isPending = isPending
}

export function mapLoginStateReset(draft: LoginFormState) {
  draft.email = loginFormState.email
  draft.password = loginFormState.password
  draft.apiError = loginFormState.apiError
  draft.fieldErrors = loginFormState.fieldErrors
  draft.hasInteractedWithEmail = loginFormState.hasInteractedWithEmail
  draft.hasInteractedWithPassword = loginFormState.hasInteractedWithPassword
  draft.isPending = loginFormState.isPending
}

export function mapEmailChange(draft: LoginFormState, email: string) {
  draft.email = email
  draft.fieldErrors.email = undefined
}

export function mapPasswordChange(draft: LoginFormState, password: string) {
  draft.password = password
  draft.fieldErrors.password = undefined
}

export function mapEmailBlur(
  draft: LoginFormState,
  errors: FieldErrors<LoginFormSchema>
) {
  draft.hasInteractedWithEmail = true
  draft.fieldErrors.email = errors.email
}

export function mapPasswordBlur(
  draft: LoginFormState,
  errors: FieldErrors<LoginFormSchema>
) {
  draft.hasInteractedWithPassword = true
  draft.fieldErrors.password = errors.password
}
