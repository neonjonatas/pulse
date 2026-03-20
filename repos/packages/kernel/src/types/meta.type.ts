import type { OccurredOnType } from './occurred-on.type'
import type { IdType } from './id.type'

/**
 * Metadata injected into every domain event at construction time.
 */
export interface MetaType {
  readonly eventId: IdType
  readonly occurredOn: OccurredOnType
}
