import { randomUUID } from 'crypto'

import { Id, IdType } from '@pack/kernel'

/**
 * Concrete entity identifier that extends Kernel's abstract Id.
 * Supports creation with an explicit value or auto-generation via UUID.
 *
 * @example
 * const id = UniqueEntityId.create()
 * const id = UniqueEntityId.create('doc-123')
 */
export class UniqueEntityId extends Id<IdType> {
  readonly value: IdType

  private constructor(value: IdType) {
    super(value)
    this.value = value
  }

  static create(value?: IdType): UniqueEntityId {
    return new UniqueEntityId(value ?? randomUUID())
  }

  toString(): IdType {
    return this.value
  }
}
