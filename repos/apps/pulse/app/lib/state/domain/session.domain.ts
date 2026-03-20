export interface Session {
  userId: string
  jwtToken: string
  refreshToken: string
  expiresAt: Date
}
