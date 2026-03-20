'use client'

import type { ChangeEvent, FocusEvent, SubmitEvent } from 'react'
import { useImmer } from 'use-immer'
import Link from 'next/link'

import { LoginFormLayout } from '@login/ui'

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator
} from '@shadcn/components/ui/field'
import { Button } from '@shadcn/components/ui/button'
import { Input } from '@shadcn/components/ui/input'

import {
  handleEmailBlur,
  handleEmailChange,
  handleFormSubmit,
  handlePasswordBlur,
  handlePasswordChange
} from './form.handlers'
import type { LoginFormState } from './form.types'
import { loginFormState } from './form-state.data'

export function LoginForm() {
  const [formState, updateFormState] = useImmer<LoginFormState>(loginFormState)

  const { email, password, fieldErrors, isPending } = formState

  const { email: emailError, password: passwordError } = fieldErrors

  function onEmailBlur(event: FocusEvent<HTMLInputElement>) {
    const input = { email: event.target.value, password: formState.password }
    handleEmailBlur(input, updateFormState)
  }

  function onPasswordBlur(event: FocusEvent<HTMLInputElement>) {
    const input = { email: formState.email, password: event.target.value }
    handlePasswordBlur(input, updateFormState)
  }

  function onEmailChange(event: ChangeEvent<HTMLInputElement>) {
    handleEmailChange(event.target.value, updateFormState)
  }

  function onPasswordChange(event: ChangeEvent<HTMLInputElement>) {
    handlePasswordChange(event.target.value, updateFormState)
  }

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    await handleFormSubmit({
      formState,
      updater: updateFormState
    })
  }

  return (
    <LoginFormLayout>
      <form onSubmit={onSubmit} aria-busy={isPending}>
        <FieldGroup>
          <Field>
            <Button variant="outline" type="button">
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Login with Google
            </Button>
          </Field>
          <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
            Or continue with
          </FieldSeparator>
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
            {emailError && (
              <FieldDescription className="text-destructive">
                {emailError[0]}
              </FieldDescription>
            )}
          </Field>
          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Link
                href="/forgot-password"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={onPasswordChange}
              onBlur={onPasswordBlur}
              required
            />
            {passwordError && (
              <FieldDescription className="text-destructive">
                {passwordError[0]}
              </FieldDescription>
            )}
          </Field>
          <Field>
            <Button type="submit">Login</Button>
            <FieldDescription className="text-center">
              Don&apos;t have an account? <Link href="/signup"> Sign up</Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </LoginFormLayout>
  )
}
