import { randomUUID } from 'crypto'

import type { EventPrimitive } from '@pack/kernel'

export function createEventEnvelope<Payload>(
  eventName: string,
  aggregateId: string,
  payload: Payload
): EventPrimitive<Payload> {
  return {
    eventId: randomUUID(),
    eventName,
    eventVersion: 1,
    aggregateId,
    occurredOn: new Date(),
    payload
  }
}
