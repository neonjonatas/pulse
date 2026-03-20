import { ValueObject } from '@pack/kernel'

interface EmailProps {
  value: string
}

export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props)
  }

  static create(value: string): Email {
    const normalized = value.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(normalized)) {
      throw new Error('Email must be valid')
    }

    return new Email({ value: normalized })
  }

  toString(): string {
    return this.props.value
  }
}
