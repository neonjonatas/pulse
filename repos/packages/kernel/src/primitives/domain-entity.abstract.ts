import { Id } from './id.abstract'

/**
 * Base class for domain entities with identity and equality by id.
 *
 * @param props - Entity properties
 * @param id - Unique identifier for the entity
 * @example
 * class Order extends DomainEntity<OrderProps> {
 *   static create(props: OrderProps) {
 *     return new Order(props, new OrderId(crypto.randomUUID()))
 *   }
 * }
 */
export abstract class DomainEntity<Props> {
  protected readonly _id: Id
  protected props: Props

  protected constructor(props: Props, id: Id) {
    this._id = id
    this.props = props
  }

  /**
   * Returns the entity's unique identifier.
   *
   * @returns The entity id
   */
  get id(): Id {
    return this._id
  }

  /**
   * Compares two entities by their id.
   *
   * @param object - Another entity to compare against
   * @returns `true` when both entities share the same id
   * @example
   * order1.equals(order2) // true if same id
   */
  equals(object?: DomainEntity<Props>): boolean {
    if (object == null) return false
    if (this === object) return true

    return this._id.equals(object._id)
  }
}
