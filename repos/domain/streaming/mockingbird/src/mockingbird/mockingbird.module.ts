import { Module } from '@nestjs/common'

import { TranscodeTrackUseCase } from '@application/use-cases'
import {
  MockingbirdEventBusPort,
  StoragePort,
  TranscoderPort
} from '@domain/ports'
import {
  natsConnectionProvider,
  NatsLifecycleService
} from '@pack/nats-broker-messaging'

import { mockingbirdEventBusProvider } from '@infra/event-bus'
import { MinioStorageAdapter } from '@infra/storage/minio-storage.adapter'
import { FfmpegTranscoderAdapter } from '@infra/transcoder/ffmpeg-transcoder.adapter'
import { TrackApprovedConsumer } from '@interface/consumers/track-approved.consumer'
import { HealthController } from '@interface/http/health.controller'

@Module({
  controllers: [HealthController],
  providers: [
    TranscodeTrackUseCase,
    TrackApprovedConsumer,
    natsConnectionProvider,
    mockingbirdEventBusProvider,
    NatsLifecycleService,
    {
      provide: StoragePort,
      useClass: MinioStorageAdapter
    },
    {
      provide: TranscoderPort,
      useClass: FfmpegTranscoderAdapter
    }
  ]
})
export class MockingbirdModule {}
