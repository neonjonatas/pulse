import type { FieldErrors } from '@infra/zod'

import type { SignupFormSchema } from './form.validation'
import { signupFormState } from './form-state.data'
import type { SignupFormState, SignupSubmitMap } from './form.types'

export function mapSignupSubmit(map: SignupSubmitMap) {
  const { draft, fieldErrors, isPending } = map

  draft.fieldErrors.name = fieldErrors?.name
  draft.fieldErrors.email = fieldErrors?.email
  draft.fieldErrors.password = fieldErrors?.password
  draft.isPending = isPending
}

export function mapSignupStateReset(draft: SignupFormState) {
  draft.name = signupFormState.name
  draft.email = signupFormState.email
  draft.password = signupFormState.password
  draft.apiError = signupFormState.apiError
  draft.fieldErrors = signupFormState.fieldErrors
  draft.hasInteractedWithName = signupFormState.hasInteractedWithName
  draft.hasInteractedWithEmail = signupFormState.hasInteractedWithEmail
  draft.hasInteractedWithPassword = signupFormState.hasInteractedWithPassword
  draft.isPending = signupFormState.isPending
}

export function mapNameChange(draft: SignupFormState, name: string) {
  draft.name = name
  draft.fieldErrors.name = undefined
}

export function mapEmailChange(draft: SignupFormState, email: string) {
  draft.email = email
  draft.fieldErrors.email = undefined
}

export function mapPasswordChange(draft: SignupFormState, password: string) {
  draft.password = password
  draft.fieldErrors.password = undefined
}

export function mapNameBlur(
  draft: SignupFormState,
  errors: FieldErrors<SignupFormSchema>
) {
  draft.hasInteractedWithName = true
  draft.fieldErrors.name = errors.name
}

export function mapEmailBlur(
  draft: SignupFormState,
  errors: FieldErrors<SignupFormSchema>
) {
  draft.hasInteractedWithEmail = true
  draft.fieldErrors.email = errors.email
}

export function mapPasswordBlur(
  draft: SignupFormState,
  errors: FieldErrors<SignupFormSchema>
) {
  draft.hasInteractedWithPassword = true
  draft.fieldErrors.password = errors.password
}
