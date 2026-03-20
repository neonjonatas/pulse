import { type NextResponse } from 'next/server'

import { ErrorFactoryService, ErrorService } from '@api/transport/http'
import { HTTP_ERROR_MAP } from '@api/transport/http'
import { isLoginBodyValid, loginInstance, LoginService } from '@api/authority'

export async function POST(request: Request): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()

  try {
    const body = await request.json()

    const loginService = new LoginService(
      isLoginBodyValid(body),
      requestId,
      loginInstance
    )

    return await loginService.login()
  } catch (error) {
    const errorFactory = new ErrorFactoryService(HTTP_ERROR_MAP)
    const errorService = new ErrorService(errorFactory)

    return errorService.normalizeRouteError(error, requestId)
  }
}
