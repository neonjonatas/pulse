import { Global, Module } from '@nestjs/common'

import { NatsModule } from './petrified/infra/nats/nats.module'
import { RedisModule } from './petrified/infra/redis/redis.module'
import { StorageModule } from './petrified/infra/storage/storage.module'
import { PetrifiedModule } from './petrified/petrified.module'
import { HealthController } from './petrified/interface/http/health.controller'

@Global()
@Module({
  imports: [NatsModule, RedisModule, StorageModule, PetrifiedModule],
  exports: [NatsModule, RedisModule, StorageModule],
  controllers: [HealthController]
})
export class AppModule {}
