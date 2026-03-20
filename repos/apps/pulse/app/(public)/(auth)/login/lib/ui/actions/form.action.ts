'use server'

import { type LoginResponse, loginInstance } from '@api/authority'
import { LoginState } from '@login/state'

export type LoginAction = typeof loginAction

export async function loginAction(body: LoginState): Promise<LoginResponse> {
  const { data } = await loginInstance.post<LoginResponse>(
    '/auth/login',
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
