import { AuthorityEvent, UserEvent } from '@pack/event-inventory'

export type SlimShadyEventMap = {
  [AuthorityEvent.UserSignedUp]: {
    userId: string
    email: string
    provider: string
    name?: string | null
  }
  [UserEvent.ProfileCreated]: {
    profileId: string
    authId: string
    email: string
  }
  [UserEvent.ProfileUpdated]: {
    profileId: string
    fields: string[]
  }
  [UserEvent.ProfileDeleted]: {
    profileId: string
    authId: string
  }
}
