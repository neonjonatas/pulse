import { ValueObject } from '@pack/kernel'

interface CountryProps {
  value: string
}

export class Country extends ValueObject<CountryProps> {
  private constructor(props: CountryProps) {
    super(props)
  }

  static create(value: string): Country {
    const normalized = value.trim().toUpperCase()

    if (!/^[A-Z]{2}$/.test(normalized)) {
      throw new Error('Country must be an ISO 3166-1 alpha-2 code')
    }

    return new Country({ value: normalized })
  }

  toString(): string {
    return this.props.value
  }
}
