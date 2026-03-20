import { NextResponse } from 'next/server'
import type { AxiosInstance } from 'axios'

import type { LoginResponse } from '@api/authority'
import type { LoginState } from '@login/state'

export class LoginService {
  constructor(
    private readonly body: LoginState,
    private readonly requestId: string,
    private readonly httpClient: AxiosInstance
  ) {}

  async login(): Promise<NextResponse> {
    const { data } = await this.httpClient.post<LoginResponse>(
      '/login',
      this.body,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'x-request-id': this.requestId
        }
      }
    )

    return NextResponse.json(data, {
      headers: { 'x-request-id': this.requestId }
    })
  }
}
