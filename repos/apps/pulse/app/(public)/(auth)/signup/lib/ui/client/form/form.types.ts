import type { StateUpdater } from '@infra/immer'
import type { FieldErrors, SchemaState } from '@infra/zod'
import type { SignupState } from '@signup/state'

import type { SignupFormSchema } from './form.validation'

export interface SignupFormState
  extends SignupState,
    SchemaState<SignupFormSchema> {
  hasInteractedWithName: boolean
  hasInteractedWithEmail: boolean
  hasInteractedWithPassword: boolean
}

export interface SignupSubmitInput {
  formState: SignupFormState
  updater: StateUpdater<SignupFormState>
}

export interface SignupSubmitMap {
  draft: SignupFormState
  isPending: boolean
  fieldErrors?: FieldErrors<SignupFormSchema>
}
