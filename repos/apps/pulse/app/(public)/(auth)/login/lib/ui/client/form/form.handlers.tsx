import { type StateUpdater } from '@infra/immer'
import { getFieldErrors } from '@infra/zod'
import { type LoginState } from '@login/state'
import { loginAction } from '@login/ui'

import {
  mapEmailBlur,
  mapEmailChange,
  mapLoginStateReset,
  mapLoginSubmit,
  mapPasswordBlur,
  mapPasswordChange
} from './form.mappers'
import { LoginFormState, LoginSubmitInput } from './form.types'
import { LoginFormSchema, loginSchema } from './form.validation'

export function handleEmailChange(
  email: LoginFormState['email'],
  updater: StateUpdater<LoginFormState>
) {
  updater((draft: LoginFormState) => mapEmailChange(draft, email))
}

export function handlePasswordChange(
  password: LoginFormState['password'],
  updater: StateUpdater<LoginFormState>
) {
  updater((draft: LoginFormState) => mapPasswordChange(draft, password))
}

export function handleEmailBlur(
  input: LoginState,
  updater: StateUpdater<LoginFormState>
) {
  const fieldErrors = getFieldErrors<LoginFormSchema>(input, loginSchema)

  if (fieldErrors === null) return

  updater((draft: LoginFormState) => mapEmailBlur(draft, fieldErrors))
}

export function handlePasswordBlur(
  input: LoginState,
  updater: StateUpdater<LoginFormState>
) {
  const fieldErrors = getFieldErrors<LoginFormSchema>(input, loginSchema)

  if (fieldErrors === null) return

  updater((draft: LoginFormState) => mapPasswordBlur(draft, fieldErrors))
}

export async function handleFormSubmit(input: LoginSubmitInput) {
  const { formState, updater } = input

  const payload = { email: formState.email, password: formState.password }

  const fieldErrors = getFieldErrors(payload, loginSchema)

  if (fieldErrors === null) return

  updater((draft: LoginFormState) =>
    mapLoginSubmit({
      draft,
      isPending: true,
      fieldErrors
    })
  )

  try {
    const response = await loginAction(payload)

    updater((draft: LoginFormState) => mapLoginStateReset(draft))
    return response
  } catch {
    updater((draft: LoginFormState) =>
      mapLoginSubmit({ draft, isPending: false })
    )
    return null
  }
}
