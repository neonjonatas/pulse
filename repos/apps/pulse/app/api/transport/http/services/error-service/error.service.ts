import { NextResponse } from 'next/server'

import {
  isHttpError,
  ErrorResponseBody,
  HttpError,
  HttpErrorName
} from '@api/transport/http'

import { ErrorFactoryService } from './error-factory.service'

export class ErrorService {
  constructor(private readonly errorFactory: ErrorFactoryService) {}

  normalizeRouteError(error: unknown, requestId: string): NextResponse {
    if (isHttpError(error)) {
      return this.buildResponse(error, requestId)
    }

    const fallback = this.errorFactory.create(HttpErrorName.InternalServerError)

    return this.buildResponse(fallback, requestId)
  }

  private buildResponse(error: HttpError, requestId: string): NextResponse {
    const body: ErrorResponseBody = {
      error: error.name,
      message: error.message
    }

    return NextResponse.json(body, {
      status: error.status,
      headers: {
        'x-request-id': requestId
      }
    })
  }
}
