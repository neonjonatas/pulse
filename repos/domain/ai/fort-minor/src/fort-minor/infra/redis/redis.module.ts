import { Module } from '@nestjs/common'
import Redis from 'ioredis'
import { requireStringEnv } from '@pack/env-orchestration'

/** Injection token for the Redis client instance. */
export const REDIS_CLIENT = 'REDIS_CLIENT'

/** Provides a Redis client connected to this microservice's own Redis instance. */
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => new Redis(requireStringEnv('REDIS_URL'))
    }
  ],
  exports: [REDIS_CLIENT]
})
export class RedisModule {}
