import { Inject, Injectable } from '@nestjs/common'
import type Redis from 'ioredis'

import { REDIS_CLIENT } from 'src/petrified/infra/redis/redis.module'
import { AudioHashPort } from 'src/petrified/application/ports/audio-hash.port'

/**
 * Redis-backed adapter for audio hash storage and lookup.
 * Maps audio hashes to track IDs for duplicate detection.
 * Keys are stored permanently (no TTL) since audio identity is immutable.
 */
@Injectable()
export class RedisAudioHashAdapter extends AudioHashPort {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {
    super()
  }

  async findByHash(audioHash: string): Promise<string | null> {
    return this.redis.get(`petrified:audio-hash:${audioHash}`)
  }

  async store(trackId: string, audioHash: string): Promise<void> {
    await this.redis.set(`petrified:audio-hash:${audioHash}`, trackId)
  }
}
