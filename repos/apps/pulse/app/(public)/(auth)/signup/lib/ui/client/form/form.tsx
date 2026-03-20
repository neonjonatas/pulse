'use client'

import type { ChangeEvent, FocusEvent, SubmitEvent } from 'react'
import Link from 'next/link'
import { useImmer } from 'use-immer'

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator
} from '@shadcn/components/ui/field'
import { Button } from '@shadcn/components/ui/button'
import { Input } from '@shadcn/components/ui/input'
import { SignupFormLayout } from '@signup/ui'

import {
  handleEmailBlur,
  handleEmailChange,
  handleFormSubmit,
  handleNameBlur,
  handleNameChange,
  handlePasswordBlur,
  handlePasswordChange
} from './form.handlers'
import { signupFormState } from './form-state.data'
import type { SignupFormState } from './form.types'

export function SignupForm() {
  const [formState, updateFormState] =
    useImmer<SignupFormState>(signupFormState)

  const { name, email, password, fieldErrors, isPending } = formState

  function onNameBlur(event: FocusEvent<HTMLInputElement>) {
    const input = {
      name: event.target.value,
      email: formState.email,
      password: formState.password
    }
    handleNameBlur(input, updateFormState)
  }

  function onEmailBlur(event: FocusEvent<HTMLInputElement>) {
    const input = {
      name: formState.name,
      email: event.target.value,
      password: formState.password
    }
    handleEmailBlur(input, updateFormState)
  }

  function onPasswordBlur(event: FocusEvent<HTMLInputElement>) {
    const input = {
      name: formState.name,
      email: formState.email,
      password: event.target.value
    }
    handlePasswordBlur(input, updateFormState)
  }

  function onNameChange(event: ChangeEvent<HTMLInputElement>) {
    handleNameChange(event.target.value, updateFormState)
  }

  function onEmailChange(event: ChangeEvent<HTMLInputElement>) {
    handleEmailChange(event.target.value, updateFormState)
  }

  function onPasswordChange(event: ChangeEvent<HTMLInputElement>) {
    handlePasswordChange(event.target.value, updateFormState)
  }

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    void handleFormSubmit({
      formState,
      updater: updateFormState
    })
  }

  return (
    <SignupFormLayout>
      <form onSubmit={onSubmit} aria-busy={isPending}>
        <FieldGroup>
          <Field>
            <Button variant="outline" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <title>Google</title>
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Sign up with Google
            </Button>
          </Field>
          <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
            Or continue with
          </FieldSeparator>
          <Field>
            <FieldLabel htmlFor="name">Full Name</FieldLabel>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name ?? ''}
              onChange={onNameChange}
              onBlur={onNameBlur}
            />
            {fieldErrors.name && (
              <FieldDescription className="text-destructive">
                {fieldErrors.name[0]}
              </FieldDescription>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={onEmailChange}
              onBlur={onEmailBlur}
              required
            />
            {fieldErrors.email && (
              <FieldDescription className="text-destructive">
                {fieldErrors.email[0]}
              </FieldDescription>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={onPasswordChange}
              onBlur={onPasswordBlur}
              required
            />
            {fieldErrors.password && (
              <FieldDescription className="text-destructive">
                {fieldErrors.password[0]}
              </FieldDescription>
            )}
            <FieldDescription>
              Must be at least 8 characters long.
            </FieldDescription>
          </Field>
          <Field>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating account...' : 'Create Account'}
            </Button>
            <FieldDescription className="text-center">
              Already have an account? <Link href="/login">Sign in</Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </SignupFormLayout>
  )
}
