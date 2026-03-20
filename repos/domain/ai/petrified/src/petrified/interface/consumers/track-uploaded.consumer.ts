import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { NatsQueueConsumerAdapter } from '@pack/nats-broker-messaging'
import type { NatsConnection } from 'nats'

import { NatsConnectionToken } from '@pack/nats-broker-messaging'
import { optionalStringEnv } from '@pack/env-orchestration'
import { GenerateFingerprintUseCase } from 'src/petrified/application/use-cases/generate-fingerprint.use-case'
import type { TrackUploadedEventMap } from 'src/petrified/domain/events/petrified-event.map'

import { TrackEvent } from '@pack/event-inventory'
/// Subscribes to `track.uploaded` and delegates to GenerateFingerprintUseCase.
@Injectable()
export class TrackUploadedConsumer implements OnApplicationBootstrap {
  private consumer: NatsQueueConsumerAdapter<TrackUploadedEventMap> | null =
    null

  constructor(
    @Inject(NatsConnectionToken)
    private readonly connection: NatsConnection | null,
    private readonly generateFingerprint: GenerateFingerprintUseCase
  ) {}

  onApplicationBootstrap(): void {
    if (!this.connection) return

    const queue = optionalStringEnv('NATS_QUEUE_GROUP', 'petrified-workers')
    this.consumer = new NatsQueueConsumerAdapter<TrackUploadedEventMap>(
      this.connection,
      queue
    )

    this.consumer.subscribe(TrackEvent.Uploaded, async (payload) => {
      const petrifiedStorage =
        payload.petrifiedStorage ?? payload.sourceStorage ?? payload.storage
      const fortMinorStorage =
        payload.fortMinorStorage ??
        payload.sourceStorage ??
        payload.transcriptionStorage
      if (!petrifiedStorage || !fortMinorStorage) return

      await this.generateFingerprint.execute({
        eventId: `track.uploaded:${payload.trackId}`,
        trackId: payload.trackId,
        storage: petrifiedStorage,
        fortMinorStorage
      })
    })
  }
}
