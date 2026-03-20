import type { IdType } from '@types'

/**
 * Base identifier abstraction for entities, aggregates, and domain events.
 */
export abstract class Id<Value extends IdType = IdType> {
  readonly value: Value

  protected constructor(value: Value) {
    this.value = value
  }

  toString(): string {
    return String(this.value)
  }

  equals(other?: Id<Value>): boolean {
    return Boolean(other && this.value === other.value)
  }
}
