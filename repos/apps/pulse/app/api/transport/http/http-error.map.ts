import { HttpErrorMeta, HttpErrorName } from './http-error.types'

export const HTTP_ERROR_MAP: Record<HttpErrorName, HttpErrorMeta> = {
  [HttpErrorName.Unauthorized]: {
    status: 401,
    message: 'Unauthorized',
    retryable: false
  },
  [HttpErrorName.BadRequest]: {
    status: 400,
    message: 'Bad request',
    retryable: false
  },
  [HttpErrorName.ValidationError]: {
    status: 422,
    message: 'Validation failed',
    retryable: false
  },
  [HttpErrorName.InternalServerError]: {
    status: 500,
    message: 'Internal server error',
    retryable: true
  },
  [HttpErrorName.Forbidden]: {
    status: 403,
    message: 'Forbidden',
    retryable: false
  },
  [HttpErrorName.NotFound]: {
    status: 404,
    message: 'Resource not found',
    retryable: false
  },
  [HttpErrorName.TooManyRequests]: {
    status: 429,
    message: 'Too many requests',
    retryable: true
  },
  [HttpErrorName.ServiceUnavailable]: {
    status: 503,
    message: 'Service unavailable',
    retryable: true
  },
  [HttpErrorName.GatewayTimeout]: {
    status: 504,
    message: 'Gateway timeout',
    retryable: true
  },
  [HttpErrorName.BadGateway]: {
    status: 502,
    message: 'Bad gateway',
    retryable: true
  },
  [HttpErrorName.RequestTimeout]: {
    status: 408,
    message: 'Request timeout',
    retryable: true
  },
  [HttpErrorName.UnprocessableEntity]: {
    status: 422,
    message: 'Unprocessable entity',
    retryable: false
  }
}
