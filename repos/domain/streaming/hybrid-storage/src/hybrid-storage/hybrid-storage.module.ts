import { Module } from '@nestjs/common'

import { StoragePort } from '@domain/ports'
import { PersistHLSPackageUseCase } from '@application/use-cases'
import {
  hybridStorageEventBusProvider,
  natsConnectionProvider,
  NatsLifecycleService
} from '@infra/event-bus'
import { MinioStorageAdapter } from '@infra/storage/minio-storage.adapter'
import { MockHLSGeneratorService } from '@infra/mock/mock-hls-generator.service'
import { HLSGeneratedConsumer } from '@interface/consumers/hls-generated.consumer'
import { HealthController } from '@interface/http/health.controller'

@Module({
  controllers: [HealthController],
  providers: [
    PersistHLSPackageUseCase,
    HLSGeneratedConsumer,
    MockHLSGeneratorService,
    natsConnectionProvider,
    hybridStorageEventBusProvider,
    NatsLifecycleService,
    {
      provide: StoragePort,
      useClass: MinioStorageAdapter
    }
  ]
})
export class HybridStorageModule {}
