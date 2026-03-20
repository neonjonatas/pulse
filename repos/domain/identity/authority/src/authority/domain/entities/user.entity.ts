import { AggregateRoot } from '@pack/kernel'
import { UniqueEntityId } from '@pack/patterns'

import { AuthorityProvider } from '@domain/value-objects'
import { UserSignedUpEvent } from '@domain/events'
export interface UserProps {
  email: string
  passwordHash?: string | null
  provider: AuthorityProvider
  providerUserId?: string | null
  name?: string | null
  profileId?: string | null
  createdAt: Date
}

export class User extends AggregateRoot<UserProps> {
  private constructor(props: UserProps, id?: UniqueEntityId) {
    super(props, id ?? UniqueEntityId.create())
  }

  static create(props: UserProps, id?: UniqueEntityId): User {
    return new User(props, id)
  }

  static signUp(
    props: UserProps,
    id: UniqueEntityId | undefined,
    meta: { eventId: string; occurredOn: Date }
  ): User {
    const user = new User(props, id)
    user.record(
      new UserSignedUpEvent(
        user.idString,
        {
          userId: user.idString,
          email: props.email,
          provider: props.provider,
          name: props.name
        },
        meta
      )
    )
    return user
  }

  get idString(): string {
    return this._id.toString()
  }

  get email(): string {
    return this.props.email
  }

  get passwordHash(): string {
    return this.props.passwordHash ?? ''
  }

  get provider(): AuthorityProvider {
    return this.props.provider
  }

  get providerUserId(): string | null {
    return this.props.providerUserId ?? null
  }

  get name(): string | null {
    return this.props.name ?? null
  }

  get profileId(): string | null {
    return this.props.profileId ?? null
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get hasPassword(): boolean {
    return Boolean(this.props.passwordHash)
  }

  toJSON(): UserProps & { id: string } {
    return { ...this.props, id: this.idString }
  }
}
