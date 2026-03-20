import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'

import { UploadTrackUseCase } from '@application/use-cases'
import {
  FileStoragePort,
  FileValidatorPort,
  ObjectStoragePort
} from '@domain/ports'
import {
  natsConnectionProvider,
  NatsLifecycleService
} from '@pack/nats-broker-messaging'

import { trackEventBusProvider } from '@infra/event-bus'
import { FileStorageAdapter } from '@infra/file-storage.adapter'
import { FileValidatorAdapter } from '@infra/file-validator.adapter'
import { MinioStorageAdapter } from '@infra/object-storage/minio-storage.adapter'
import { uploadConfigProviders } from '@infra/upload-config.provider'
import { UploadCleanupService } from '@infra/cleanup/upload-cleanup.service'
import { UploadController, HealthController } from '@interface/http'

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [UploadController, HealthController],
  providers: [
    UploadTrackUseCase,
    ...uploadConfigProviders,
    natsConnectionProvider,
    trackEventBusProvider,
    NatsLifecycleService,
    UploadCleanupService,
    {
      provide: FileValidatorPort,
      useClass: FileValidatorAdapter
    },
    {
      provide: FileStoragePort,
      useClass: FileStorageAdapter
    },
    {
      provide: ObjectStoragePort,
      useClass: MinioStorageAdapter
    }
  ]
})
export class SoundgardenModule {}
