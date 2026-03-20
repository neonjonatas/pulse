import type { Request } from 'express'

export function getRequestContext(request: Request) {
  const forwarded = request.headers['x-forwarded-for']
  const ipAddress =
    typeof forwarded === 'string' ? forwarded.split(',')[0]?.trim() : request.ip

  const userAgent = request.headers['user-agent'] ?? null

  return {
    ipAddress: ipAddress ?? null,
    userAgent
  }
}
