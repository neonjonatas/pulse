import { AuthorityEvent, UserEvent } from '@pack/event-inventory'

export type AuthorityEventMap = {
  [AuthorityEvent.UserSignedUp]: {
    userId: string
    email: string
    provider: string
    name?: string | null
  }
  [AuthorityEvent.UserLoggedIn]: {
    userId: string
    email: string
    provider: string
    sessionId: string
    ipAddress?: string | null
    userAgent?: string | null
  }
  [AuthorityEvent.TokenRefreshed]: {
    userId: string
    sessionId: string
  }
  [AuthorityEvent.UserLoggedOut]: {
    userId: string
    sessionId: string
  }
  [UserEvent.ProfileCreated]: {
    profileId: string
    authId: string
    email: string
  }
}
