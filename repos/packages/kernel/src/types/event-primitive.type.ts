import type { IdType } from './id.type'
import type { OccurredOnType } from './occurred-on.type'

/**
 * Serialized domain event envelope used for transport and persistence.
 */
export interface EventPrimitive<Payload = Record<string, unknown>> {
  readonly eventId: IdType
  readonly eventName: string
  readonly eventVersion: number
  readonly aggregateId: IdType
  readonly occurredOn: OccurredOnType
  readonly payload: Payload
}
