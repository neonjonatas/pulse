import type {
  ObjectPrimitive,
  EventPrimitive,
  IdType,
  OccurredOnType,
  MetaType
} from '@types'

/**
 * Base class for all domain events.
 * Carries identity, occurrence metadata, and a frozen payload.
 * Subclasses declare `eventName` and `eventVersion` as readonly getters.
 */
export abstract class DomainEvent<
  Domain,
  Props extends ObjectPrimitive<Domain>
> {
  readonly eventId: IdType
  readonly aggregateId: IdType
  readonly occurredOn: OccurredOnType
  readonly props: Readonly<Props>

  protected constructor(aggregateId: IdType, props: Props, meta: MetaType) {
    this.eventId = meta.eventId
    this.aggregateId = aggregateId
    this.occurredOn = meta.occurredOn
    this.props = Object.freeze(props)
  }

  abstract get eventName(): string
  abstract get eventVersion(): number

  toPrimitive(): EventPrimitive<Props> {
    return {
      eventId: this.eventId,
      eventName: this.eventName,
      eventVersion: this.eventVersion,
      aggregateId: this.aggregateId,
      occurredOn: this.occurredOn,
      payload: this.props
    }
  }
}
