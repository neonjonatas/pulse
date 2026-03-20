/**
 * Immutable value object with equality by structural comparison.
 *
 * @param props - Value object properties (frozen in constructor)
 * @example
 * class Money extends ValueObject<{ amount: number; currency: string }> {
 *   static create(amount: number, currency: string) {
 *     return new Money({ amount, currency })
 *   }
 * }
 */
export abstract class ValueObject<Props> {
  protected readonly props: Props

  constructor(props: Props) {
    this.props = Object.freeze(props)
  }

  /**
   * Compares two value objects by their props (JSON stringify).
   *
   * @param vo - Another value object to compare against
   * @returns `true` when props are structurally equal
   * @example
   * money1.equals(money2) // true if same amount and currency
   */
  equals(vo?: ValueObject<Props>): boolean {
    if (!vo) return false
    return JSON.stringify(this.props) === JSON.stringify(vo.props)
  }
}
