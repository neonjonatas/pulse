import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Model } from 'mongoose'

import { IdempotencyPort } from 'src/stereo/application/ports/idempotency.port'
import { ProcessedEventDocument } from './processed-event.schema'

/**
 * MongoDB-backed idempotency guard for Stereo.
 * Stores processed event IDs to prevent duplicate reasoning
 * from redelivered NATS messages.
 */
@Injectable()
export class MongoIdempotencyAdapter extends IdempotencyPort {
  constructor(
    @InjectModel(ProcessedEventDocument.name)
    private readonly model: Model<ProcessedEventDocument>
  ) {
    super()
  }

  async hasProcessed(eventId: string): Promise<boolean> {
    const count = await this.model.countDocuments({ eventId })
    return count > 0
  }

  async markProcessed(eventId: string): Promise<void> {
    await this.model.updateOne(
      { eventId },
      { $setOnInsert: { eventId, processedAt: new Date() } },
      { upsert: true }
    )
  }
}
