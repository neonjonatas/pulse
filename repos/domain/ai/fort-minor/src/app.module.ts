import { Global, Module } from '@nestjs/common'

import { NatsModule } from '@infra/nats/nats.module'
import { RedisModule } from '@infra/redis/redis.module'
import { StorageModule } from '@infra/storage/storage.module'
import { HealthController } from '@interface/http'

import { FortMinorModule } from './fort-minor/fort-minor.module'

@Global()
@Module({
  imports: [NatsModule, RedisModule, StorageModule, FortMinorModule],
  exports: [NatsModule, RedisModule, StorageModule],
  controllers: [HealthController]
})
export class AppModule {}
