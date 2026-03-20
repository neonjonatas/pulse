import { Session } from '@domain/entities'

export abstract class SessionPort {
  abstract create(session: Session): Promise<void>
  abstract findById(id: string): Promise<Session | null>
  abstract update(session: Session): Promise<void>
  abstract deleteById(id: string): Promise<void>
}
