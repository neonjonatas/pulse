import { ValueObject } from '@pack/kernel'

interface UserIdProps {
  value: string
}

export class UserId extends ValueObject<UserIdProps> {
  private constructor(props: UserIdProps) {
    super(props)
  }

  static create(value: string): UserId {
    if (!value || value.trim().length === 0) {
      throw new Error('User id is required')
    }

    return new UserId({ value })
  }

  toString(): string {
    return this.props.value
  }
}
