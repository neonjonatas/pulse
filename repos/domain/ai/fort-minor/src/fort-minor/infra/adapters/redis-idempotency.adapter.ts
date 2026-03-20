import { Inject, Injectable } from '@nestjs/common'
import type Redis from 'ioredis'

import { REDIS_CLIENT } from '@infra/redis/redis.module'
import { IdempotencyPort } from '@application/ports/idempotency.port'

const IDEMPOTENCY_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days

/**
 * Redis-backed idempotency guard for Fort Minor.
 * Stores processed event IDs with a 30-day TTL to prevent
 * duplicate transcription from redelivered NATS messages.
 */
@Injectable()
export class RedisIdempotencyAdapter extends IdempotencyPort {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {
    super()
  }

  async hasProcessed(eventId: string): Promise<boolean> {
    const result = await this.redis.exists(`fort-minor:idempotency:${eventId}`)
    return result === 1
  }

  async markProcessed(eventId: string): Promise<void> {
    await this.redis.set(
      `fort-minor:idempotency:${eventId}`,
      '1',
      'EX',
      IDEMPOTENCY_TTL_SECONDS
    )
  }
}
