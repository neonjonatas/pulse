import { Injectable, OnModuleInit } from '@nestjs/common'

import { MockingbirdEventBusPort } from '@domain/ports'
import { TranscodeTrackUseCase } from '@application/use-cases'
import { createEventEnvelope } from '@domain/events'

import { TrackEvent } from '@pack/event-inventory'
@Injectable()
export class TrackApprovedConsumer implements OnModuleInit {
  private unsubscribe: (() => void) | null = null

  constructor(
    private readonly eventBus: MockingbirdEventBusPort,
    private readonly transcodeTrack: TranscodeTrackUseCase
  ) {}

  onModuleInit(): void {
    this.unsubscribe = this.eventBus.on(
      TrackEvent.Approved,
      async (envelope) => {
        const payload = envelope.payload
        const trackId = payload.trackId
        console.log('[Mockingbird] Processing track.approved', {
          trackId,
          objectKey: payload.objectKey,
          sourceStorage: payload.sourceStorage
        })

        const bucket = payload.sourceStorage?.bucket
        const key = payload.sourceStorage?.key
        if (
          !bucket ||
          !key ||
          !payload.objectKey ||
          payload.objectKey !== key
        ) {
          const message =
            'Invalid track.approved payload: objectKey/sourceStorage mismatch'
          console.error('[Mockingbird] Invalid track.approved payload', {
            trackId,
            payload
          })
          await this.eventBus.emit(
            TrackEvent.TranscodingFailed,
            createEventEnvelope(TrackEvent.TranscodingFailed, trackId, {
              trackId,
              errorCode: 'TRACK_APPROVED_CONTRACT_INVALID',
              message
            })
          )
          return
        }

        try {
          await this.transcodeTrack.execute({
            trackId,
            sourceStorage: payload.sourceStorage
          })
        } catch (error) {
          console.error('[Mockingbird] Transcode failed', { trackId, error })
        }
      }
    )

    console.log('[Mockingbird] Subscribed to track.approved')
  }
}
