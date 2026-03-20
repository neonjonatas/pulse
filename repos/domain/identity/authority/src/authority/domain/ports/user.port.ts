import { User } from '@domain/entities'
import { Email } from '@domain/value-objects'

export abstract class UserPort {
  abstract findByEmail(email: Email): Promise<User | null>
  abstract findById(id: string): Promise<User | null>
  abstract create(user: User): Promise<void>
  abstract updateProfileId(userId: string, profileId: string): Promise<void>
}
