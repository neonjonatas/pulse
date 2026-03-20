import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import type { NatsConnection } from 'nats'
import { BroadcastPipelineEventUseCase } from '../../application/use-cases/broadcast-pipeline-event.use-case'
import { NatsConnectionToken } from '@pack/nats-broker-messaging'
import { PIPELINE_EVENT_MESSAGES } from './pipeline-event-messages.data'

import { TrackEvent } from '@pack/event-inventory'
const MOCK_EVENT_SEQUENCE = [
  TrackEvent.UploadReceived,
  TrackEvent.UploadValidated,
  TrackEvent.UploadStored,
  TrackEvent.Uploaded,
  TrackEvent.PetrifiedGenerated,
  TrackEvent.PetrifiedSongUnknown,
  TrackEvent.FortMinorStarted,
  TrackEvent.FortMinorCompleted,
  TrackEvent.StereoStarted,
  TrackEvent.Approved,
  TrackEvent.TranscodingStarted,
  TrackEvent.TranscodingCompleted,
  TrackEvent.HlsGenerated,
  TrackEvent.HlsStored
]

const MOCK_DELAY_MS = 1200
const LOOP_PAUSE_MS = 5000

@Injectable()
export class MockEventGeneratorService implements OnModuleInit {
  constructor(
    private readonly broadcastUseCase: BroadcastPipelineEventUseCase,
    @Inject(NatsConnectionToken) private readonly nc: NatsConnection | null
  ) {}

  onModuleInit(): void {
    const mockMode = process.env.MOCK_MODE === 'true'
    if (this.nc && !mockMode) {
      console.log('[Backstage] NATS connected, skipping mock event generator')
      return
    }

    void this.runMockSequence()
  }

  private async runMockSequence(): Promise<void> {
    while (true) {
      const trackId = crypto.randomUUID()

      for (const eventType of MOCK_EVENT_SEQUENCE) {
        await new Promise((r) => setTimeout(r, MOCK_DELAY_MS))

        await this.broadcastUseCase.execute({
          trackId,
          eventType,
          payload: {
            message: PIPELINE_EVENT_MESSAGES[eventType] ?? eventType
          }
        })

        console.log('[Backstage] Mock event:', eventType, trackId)
      }

      await new Promise((r) => setTimeout(r, LOOP_PAUSE_MS))
    }
  }
}
