'use server'

import { type SignupResponse, loginInstance } from '@api/authority'
import type { SignupState } from '@signup/state'

export type SignupAction = typeof signupAction

export async function signupAction(body: SignupState): Promise<SignupResponse> {
  const { data } = await loginInstance.post<SignupResponse>(
    '/auth/signup',
    body,
    {
      headers: {
        'x-request-id': crypto.randomUUID(),
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    }
  )

  return data
}
