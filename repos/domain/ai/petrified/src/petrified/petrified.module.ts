import { Module } from '@nestjs/common'

import { GenerateFingerprintUseCase } from 'src/petrified/application/use-cases/generate-fingerprint.use-case'
import { PetrifiedEventBusPort } from 'src/petrified/application/ports/petrified-event-bus.port'
import { PetrifiedGeneratorPort } from 'src/petrified/application/ports/petrified-generator.port'
import { AudioHashPort } from 'src/petrified/application/ports/audio-hash.port'
import { IdempotencyPort } from 'src/petrified/application/ports/idempotency.port'
import { ChromaprintAdapter } from 'src/petrified/infra/adapters/chromaprint.adapter'
import { petrifiedEventBusProvider } from 'src/petrified/infra/adapters/petrified-event-bus.provider'
import { RedisAudioHashAdapter } from 'src/petrified/infra/adapters/redis-audio-hash.adapter'
import { RedisIdempotencyAdapter } from 'src/petrified/infra/adapters/redis-idempotency.adapter'
import { TrackUploadedConsumer } from 'src/petrified/interface/consumers/track-uploaded.consumer'

/// Handles acoustic fingerprinting of uploaded tracks.
///
/// Consumes: track.uploaded
/// Emits: track.petrified.generated, track.petrified.song.unknown,
///        track.duplicate.detected, track.petrified.failed
@Module({
  providers: [
    GenerateFingerprintUseCase,
    petrifiedEventBusProvider,
    TrackUploadedConsumer,
    { provide: PetrifiedGeneratorPort, useClass: ChromaprintAdapter },
    { provide: IdempotencyPort, useClass: RedisIdempotencyAdapter },
    { provide: AudioHashPort, useClass: RedisAudioHashAdapter }
  ]
})
export class PetrifiedModule {}
