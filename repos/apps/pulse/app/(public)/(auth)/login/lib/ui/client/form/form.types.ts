import { SchemaState, FieldErrors } from '@infra/zod'
import { LoginState } from '@login/state'
import type { StateUpdater } from '@infra/immer'

import { LoginFormSchema } from './form.validation'

export interface LoginFormState
  extends LoginState,
    SchemaState<LoginFormSchema> {
  hasInteractedWithEmail: boolean
  hasInteractedWithPassword: boolean
}

export interface LoginSubmitInput {
  formState: LoginFormState
  updater: StateUpdater<LoginFormState>
}

export interface LoginSubmitMap {
  draft: LoginFormState
  isPending: boolean
  fieldErrors?: FieldErrors<LoginFormSchema>
}
