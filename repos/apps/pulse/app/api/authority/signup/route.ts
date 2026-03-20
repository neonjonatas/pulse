import { type NextResponse } from 'next/server'

import {
  ErrorFactoryService,
  ErrorService,
  isSignupBodyValid,
  loginInstance,
  SignupService
} from '@api/authority'
import { HTTP_ERROR_MAP } from '@api/transport/http'

export async function POST(request: Request): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()

  try {
    const body = await request.json()

    const signupService = new SignupService(
      isSignupBodyValid(body),
      requestId,
      loginInstance
    )

    return await signupService.signup()
  } catch (error) {
    const errorFactory = new ErrorFactoryService(HTTP_ERROR_MAP)
    const errorService = new ErrorService(errorFactory)

    return errorService.normalizeRouteError(error, requestId)
  }
}
