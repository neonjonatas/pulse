import { z } from 'zod'

/**
 * Runtime schema for EventPrimitive-like envelopes received from NATS.
 */
export const eventPrimitiveEnvelopeSchema = z.object({
  eventId: z.string().min(1),
  eventName: z.string().min(1),
  eventVersion: z.number().int().positive(),
  aggregateId: z.string().min(1),
  occurredOn: z
    .union([z.date(), z.string().datetime()])
    .transform((value: Date | string) =>
      value instanceof Date ? value : new Date(value)
    ),
  payload: z.record(z.string(), z.unknown())
})

/**
 * Inferred validated envelope type.
 */
export type ValidatedEnvelope = z.infer<typeof eventPrimitiveEnvelopeSchema>
