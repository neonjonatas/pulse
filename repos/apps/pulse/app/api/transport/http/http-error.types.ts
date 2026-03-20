export enum HttpErrorName {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  ValidationError = 'VALIDATION_ERROR',
  InternalServerError = 'INTERNAL_SERVER_ERROR',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  TooManyRequests = 'TOO_MANY_REQUESTS',
  ServiceUnavailable = 'SERVICE_UNAVAILABLE',
  GatewayTimeout = 'GATEWAY_TIMEOUT',
  BadGateway = 'BAD_GATEWAY',
  RequestTimeout = 'REQUEST_TIMEOUT',
  UnprocessableEntity = 'UNPROCESSABLE_ENTITY'
}

export interface HttpErrorMeta {
  status: number
  message: string
  retryable: boolean
}

export interface HttpError extends HttpErrorMeta {
  name: HttpErrorName
}

export interface ErrorResponseBody {
  error: HttpErrorName
  message: string
}
