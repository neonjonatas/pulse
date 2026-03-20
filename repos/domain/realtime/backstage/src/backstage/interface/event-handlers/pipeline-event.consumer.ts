import {
  Inject,
  Injectable,
  OnModuleInit,
  OnModuleDestroy
} from '@nestjs/common'
import { StringCodec, type NatsConnection } from 'nats'

import {
  BroadcastPipelineEventUseCase,
  RecordPipelineEventUseCase
} from '@application/use-cases'
import { NatsConnectionToken } from '@pack/nats-broker-messaging'

const TRACK_SUBJECT_PREFIX = 'track.>'

@Injectable()
export class PipelineEventConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly sc = StringCodec()
  private unsubscribe: (() => Promise<void>) | null = null

  constructor(
    @Inject(NatsConnectionToken) private readonly nc: NatsConnection | null,
    private readonly recordPipelineEvent: RecordPipelineEventUseCase,
    private readonly broadcastPipelineEvent: BroadcastPipelineEventUseCase
  ) {}

  onModuleInit(): void {
    if (!this.nc) {
      console.log('[Backstage] NATS_URL not set, skipping event subscription')
      return
    }

    const sub = this.nc.subscribe(TRACK_SUBJECT_PREFIX)

    void (async () => {
      for await (const msg of sub) {
        try {
          const subject = msg.subject
          const payload = JSON.parse(this.sc.decode(msg.data)) as Record<
            string,
            unknown
          >

          const trackId =
            typeof payload.trackId === 'string'
              ? payload.trackId
              : (payload.track_id ?? payload.id)

          if (!trackId || typeof trackId !== 'string') {
            console.error('[Backstage] Event missing trackId', {
              subject,
              payload
            })
            continue
          }

          await this.recordPipelineEvent.execute({
            eventType: subject,
            trackId,
            payload
          })

          await this.broadcastPipelineEvent.execute({
            trackId,
            eventType: subject,
            payload
          })

          console.log('[Backstage] Recorded event', { subject, trackId })
        } catch (error) {
          console.error('[Backstage] Failed to process event', {
            subject: msg.subject,
            error: error instanceof Error ? error.message : String(error)
          })
        }
      }
    })()

    this.unsubscribe = async () => {
      await sub.drain()
    }

    console.log('[Backstage] Subscribed to', TRACK_SUBJECT_PREFIX)
  }

  async onModuleDestroy(): Promise<void> {
    if (this.unsubscribe) {
      console.log('[Backstage] Draining NATS subscription...')
      await this.unsubscribe()
      this.unsubscribe = null
      console.log('[Backstage] NATS subscription drained')
    }
  }
}
