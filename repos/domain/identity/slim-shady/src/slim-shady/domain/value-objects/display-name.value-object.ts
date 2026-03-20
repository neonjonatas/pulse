import { ValueObject } from '@pack/kernel'

interface DisplayNameProps {
  value: string
}

export class DisplayName extends ValueObject<DisplayNameProps> {
  private constructor(props: DisplayNameProps) {
    super(props)
  }

  static create(value: string): DisplayName {
    const normalized = value.trim()

    if (normalized.length < 1 || normalized.length > 50) {
      throw new Error('Display name must have between 1 and 50 characters')
    }

    return new DisplayName({ value: normalized })
  }

  toString(): string {
    return this.props.value
  }
}
