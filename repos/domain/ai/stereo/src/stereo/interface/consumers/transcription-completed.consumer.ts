import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { NatsQueueConsumerAdapter } from '@pack/nats-broker-messaging'
import type { NatsConnection } from 'nats'

import { NatsConnectionToken } from '@pack/nats-broker-messaging'
import { optionalStringEnv } from '@pack/env-orchestration'
import { AggregateTranscriptionSignalUseCase } from 'src/stereo/application/use-cases/aggregate-transcription-signal.use-case'
import { RunStereoUseCase } from 'src/stereo/application/use-cases/run-stereo.use-case'
import type { StereoInboundEventMap } from '@domain/events'

import { TrackEvent } from '@pack/event-inventory'
/// Subscribes to `track.fort-minor.completed`, stores the transcription
/// signal, and checks if stereo can now start.
@Injectable()
export class TranscriptionCompletedConsumer implements OnApplicationBootstrap {
  constructor(
    @Inject(NatsConnectionToken)
    private readonly connection: NatsConnection | null,

    private readonly aggregateTranscription: AggregateTranscriptionSignalUseCase,
    private readonly runStereo: RunStereoUseCase
  ) {}

  onApplicationBootstrap(): void {
    if (!this.connection) return

    const queueBase = optionalStringEnv('NATS_QUEUE_GROUP', 'stereo-workers')
    const queue = `${queueBase}-transcription`
    const consumer = new NatsQueueConsumerAdapter<StereoInboundEventMap>(
      this.connection,
      queue
    )

    consumer.subscribe(TrackEvent.FortMinorCompleted, async (payload) => {
      await this.aggregateTranscription.execute({
        trackId: payload.trackId,
        text: payload.text,
        language: payload.language,
        durationInSeconds: payload.durationInSeconds
      })

      await this.runStereo.execute({
        eventId: `stereo:fort-minor:${payload.trackId}`,
        trackId: payload.trackId
      })
    })
  }
}
