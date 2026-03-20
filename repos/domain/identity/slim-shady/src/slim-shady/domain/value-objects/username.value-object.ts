import { ValueObject } from '@pack/kernel'

interface UsernameProps {
  value: string
}

export class Username extends ValueObject<UsernameProps> {
  private constructor(props: UsernameProps) {
    super(props)
  }

  static create(value: string): Username {
    const normalized = value.trim().toLowerCase()

    if (!/^[a-z0-9_]{3,30}$/.test(normalized)) {
      throw new Error(
        'Username must have 3-30 characters and use only lowercase letters, numbers, and underscores'
      )
    }

    return new Username({ value: normalized })
  }

  toString(): string {
    return this.props.value
  }
}
