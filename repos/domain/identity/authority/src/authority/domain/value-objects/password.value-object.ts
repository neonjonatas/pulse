import { ValueObject } from '@pack/kernel'

interface PasswordProps {
  value: string
}

export class Password extends ValueObject<PasswordProps> {
  private constructor(props: PasswordProps) {
    super(props)
  }

  static create(value: string): Password {
    if (value.length < 8) {
      throw new Error('Password must have at least 8 characters')
    }

    return new Password({ value })
  }

  toString(): string {
    return this.props.value
  }
}
