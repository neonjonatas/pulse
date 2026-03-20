import type { NatsConnection } from 'nats'
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common'

import {
  NatsQueueConsumerAdapter,
  NatsConnectionToken
} from '@pack/nats-broker-messaging'
import { optionalStringEnv } from '@pack/env-orchestration'
import { TranscribeTrackUseCase } from '@application/use-cases'
import type { PetrifiedGeneratedEventMap } from '@domain/events'

import { TrackEvent } from '@pack/event-inventory'
/// Subscribes to `track.petrified.generated` and triggers audio transcription.
@Injectable()
export class PetrifiedGeneratedConsumer implements OnApplicationBootstrap {
  private consumer: NatsQueueConsumerAdapter<PetrifiedGeneratedEventMap> | null =
    null

  @Inject(NatsConnectionToken)
  private readonly connection!: NatsConnection | null

  constructor(private readonly transcribeTrack: TranscribeTrackUseCase) {}

  onApplicationBootstrap(): void {
    if (!this.connection) return

    const queueBase = optionalStringEnv(
      'NATS_QUEUE_GROUP',
      'fort-minor-workers'
    )
    const queue = `${queueBase}-petrified`
    this.consumer = new NatsQueueConsumerAdapter<PetrifiedGeneratedEventMap>(
      this.connection,
      queue
    )

    this.consumer.subscribe(TrackEvent.PetrifiedGenerated, async (payload) => {
      await this.transcribeTrack.execute({
        eventId: `track.petrified.generated:${payload.trackId}`,
        trackId: payload.trackId,
        storage: payload.storage
      })
    })
  }
}
