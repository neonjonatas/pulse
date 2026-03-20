import { Profile } from '@domain'
import { avatarMock } from '@mocks'

export const profileMock = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: avatarMock
} satisfies Profile
