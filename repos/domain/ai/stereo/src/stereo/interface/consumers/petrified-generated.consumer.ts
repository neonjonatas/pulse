import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { NatsQueueConsumerAdapter } from '@pack/nats-broker-messaging'
import type { NatsConnection } from 'nats'

import { NatsConnectionToken } from '@pack/nats-broker-messaging'
import { optionalStringEnv } from '@pack/env-orchestration'
import { AggregateFingerprintSignalUseCase } from 'src/stereo/application/use-cases/aggregate-fingerprint-signal.use-case'
import { RunStereoUseCase } from 'src/stereo/application/use-cases/run-stereo.use-case'
import type { StereoInboundEventMap } from '@domain/events'

import { TrackEvent } from '@pack/event-inventory'
/// Subscribes to `track.petrified.generated`, stores the fingerprint signal,
/// and checks if stereo can now start.
@Injectable()
export class PetrifiedGeneratedConsumer implements OnApplicationBootstrap {
  constructor(
    @Inject(NatsConnectionToken)
    private readonly connection: NatsConnection | null,
    private readonly aggregateFingerprint: AggregateFingerprintSignalUseCase,
    private readonly runStereo: RunStereoUseCase
  ) {}

  onApplicationBootstrap(): void {
    if (!this.connection) return

    const queueBase = optionalStringEnv('NATS_QUEUE_GROUP', 'stereo-workers')
    const queue = `${queueBase}-petrified`
    const consumer = new NatsQueueConsumerAdapter<StereoInboundEventMap>(
      this.connection,
      queue
    )

    consumer.subscribe(TrackEvent.PetrifiedGenerated, async (payload) => {
      await this.aggregateFingerprint.execute({
        trackId: payload.trackId,
        fingerprintHash: payload.fingerprintHash,
        audioHash: payload.audioHash,
        storage: payload.storage
      })

      await this.runStereo.execute({
        eventId: `stereo:petrified:${payload.trackId}`,
        trackId: payload.trackId
      })
    })
  }
}
