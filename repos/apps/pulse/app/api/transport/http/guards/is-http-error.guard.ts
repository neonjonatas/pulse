import type { HttpError } from '@api/transport/http'

export function isHttpError(error: unknown): error is HttpError {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  const candidate = error as Partial<HttpError>

  return (
    typeof candidate.name === 'string' &&
    typeof candidate.status === 'number' &&
    typeof candidate.message === 'string'
  )
}
