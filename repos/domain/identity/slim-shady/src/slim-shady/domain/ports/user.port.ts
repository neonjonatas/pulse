import { User } from '@domain/entities'

export abstract class UserPort {
  abstract create(user: User): Promise<void>
  abstract findById(id: string): Promise<User | null>
  abstract findByAuthId(authId: string): Promise<User | null>
  abstract findByUsername(username: string): Promise<User | null>
  abstract update(user: User): Promise<void>
}
