import type { StateUpdater } from '@infra/immer'
import type { SignupState } from '@signup/state'
import { getFieldErrors } from '@infra/zod'

import { signupAction } from '@signup/ui'

import {
  mapEmailBlur,
  mapEmailChange,
  mapNameBlur,
  mapNameChange,
  mapPasswordBlur,
  mapPasswordChange,
  mapSignupStateReset,
  mapSignupSubmit
} from './form.mappers'
import type { SignupFormState, SignupSubmitInput } from './form.types'
import type { SignupFormSchema } from './form.validation'
import { signupSchema } from './form.validation'

export function handleNameChange(
  name: SignupFormState['name'],
  updater: StateUpdater<SignupFormState>
) {
  updater((draft: SignupFormState) => mapNameChange(draft, name ?? ''))
}

export function handleEmailChange(
  email: SignupFormState['email'],
  updater: StateUpdater<SignupFormState>
) {
  updater((draft: SignupFormState) => mapEmailChange(draft, email))
}

export function handlePasswordChange(
  password: SignupFormState['password'],
  updater: StateUpdater<SignupFormState>
) {
  updater((draft: SignupFormState) => mapPasswordChange(draft, password))
}

export function handleNameBlur(
  input: SignupState,
  updater: StateUpdater<SignupFormState>
) {
  const fieldErrors = getFieldErrors<SignupFormSchema>(input, signupSchema)

  if (fieldErrors === null) return

  updater((draft: SignupFormState) => mapNameBlur(draft, fieldErrors))
}

export function handleEmailBlur(
  input: SignupState,
  updater: StateUpdater<SignupFormState>
) {
  const fieldErrors = getFieldErrors<SignupFormSchema>(input, signupSchema)

  if (fieldErrors === null) return

  updater((draft: SignupFormState) => mapEmailBlur(draft, fieldErrors))
}

export function handlePasswordBlur(
  input: SignupState,
  updater: StateUpdater<SignupFormState>
) {
  const fieldErrors = getFieldErrors<SignupFormSchema>(input, signupSchema)

  if (fieldErrors === null) return

  updater((draft: SignupFormState) => mapPasswordBlur(draft, fieldErrors))
}

export async function handleFormSubmit(input: SignupSubmitInput) {
  const { formState, updater } = input

  const payload = {
    name: formState.name,
    email: formState.email,
    password: formState.password
  }

  const fieldErrors = getFieldErrors(payload, signupSchema)

  if (fieldErrors) {
    updater((draft: SignupFormState) =>
      mapSignupSubmit({ draft, fieldErrors, isPending: false })
    )
    return
  }

  updater((draft: SignupFormState) =>
    mapSignupSubmit({ draft, isPending: true })
  )

  try {
    await signupAction(payload)
    updater((draft: SignupFormState) => mapSignupStateReset(draft))
  } catch {
    updater((draft: SignupFormState) =>
      mapSignupSubmit({ draft, isPending: false })
    )
  }
}
