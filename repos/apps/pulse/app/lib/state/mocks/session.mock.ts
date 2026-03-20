import { Session } from '@domain'

export const sessionMock = {
  userId: 'usr_550e8400-e29b-41d4-a716-446655440000',
  jwtToken: '5915c581-003f-4f25-becd-57a56be7796e',
  refreshToken: '86e2e1b1-6942-4a89-b541-267fe18a5756',
  expiresAt: new Date(Date.now() + 1_000_000_000)
} satisfies Session
