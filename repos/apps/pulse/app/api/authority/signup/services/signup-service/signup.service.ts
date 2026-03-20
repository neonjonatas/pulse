import { NextResponse } from 'next/server'
import type { AxiosInstance } from 'axios'

import type {
  SignupBody,
  SignupResponse
} from '@api/authority/signup/signup.types'

export class SignupService {
  constructor(
    private readonly body: SignupBody,
    private readonly requestId: string,
    private readonly httpClient: AxiosInstance
  ) {}

  async signup(): Promise<NextResponse> {
    const { data } = await this.httpClient.post<SignupResponse>(
      '/signup',
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
