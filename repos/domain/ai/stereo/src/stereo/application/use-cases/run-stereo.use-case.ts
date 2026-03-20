import { Inject, Injectable } from '@nestjs/common'

import { UseCase } from '@pack/kernel'

import { IdempotencyPort } from 'src/stereo/application/ports/idempotency.port'
import { StereoPort } from 'src/stereo/application/ports/stereo.port'
import { StereoEventBusPort } from 'src/stereo/application/ports/stereo-event-bus.port'
import { TrackStatePort } from 'src/stereo/application/ports/track-state.port'

import { TrackEvent } from '@pack/event-inventory'
import { createEventEnvelope } from '@domain/events'
export interface RunStereoInput {
  eventId: string
  trackId: string
}

/// Triggered when both fingerprint and transcription signals are ready.
/// Runs AI reasoning and emits the approval or rejection decision.
@Injectable()
export class RunStereoUseCase extends UseCase<RunStereoInput, void> {
  constructor(
    @Inject(StereoEventBusPort)
    private readonly events: StereoEventBusPort,
    private readonly trackState: TrackStatePort,
    private readonly stereo: StereoPort,
    private readonly idempotency: IdempotencyPort
  ) {
    super()
  }

  async execute(input: RunStereoInput): Promise<void> {
    const { eventId, trackId } = input

    if (await this.idempotency.hasProcessed(eventId)) return

    const state = await this.trackState.findOrCreate(trackId)

    if (!state.fingerprintReady || !state.transcriptionReady) return
    if (state.stereoStarted) return

    if (!state.sourceStorage) {
      void this.events
        .emit(
          TrackEvent.StereoFailed,
          createEventEnvelope(TrackEvent.StereoFailed, trackId, {
            trackId,
            errorCode: 'SOURCE_STORAGE_MISSING',
            message:
              'Cannot emit track.approved without sourceStorage (bucket/key) in stereo state'
          })
        )
        .catch(() => undefined)
      return
    }

    if (!state.sourceStorage.bucket || !state.sourceStorage.key) {
      void this.events
        .emit(
          TrackEvent.StereoFailed,
          createEventEnvelope(TrackEvent.StereoFailed, trackId, {
            trackId,
            errorCode: 'SOURCE_STORAGE_INVALID',
            message: 'sourceStorage must include both bucket and key'
          })
        )
        .catch(() => undefined)
      return
    }

    await this.trackState.markStereoStarted(trackId)

    void this.events
      .emit(
        TrackEvent.StereoStarted,
        createEventEnvelope(TrackEvent.StereoStarted, trackId, {
          trackId,
          startedAt: new Date().toISOString()
        })
      )
      .catch(() => undefined)

    let result: Awaited<ReturnType<StereoPort['reason']>>

    try {
      result = await this.stereo.reason({
        trackId,
        fingerprintHash: state.fingerprintHash ?? '',
        audioHash: state.audioHash ?? '',
        transcriptionText: state.transcriptionText ?? '',
        transcriptionLanguage: state.transcriptionLanguage ?? 'unknown',
        transcriptionDuration: state.transcriptionDuration ?? 0
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'AI reasoning failed'
      void this.events
        .emit(
          TrackEvent.StereoFailed,
          createEventEnvelope(TrackEvent.StereoFailed, trackId, {
            trackId,
            errorCode: 'AI_STEREO_FAILED',
            message
          })
        )
        .catch(() => undefined)
      return
    }

    if (result.decision === 'approved') {
      void this.events
        .emit(
          TrackEvent.Approved,
          createEventEnvelope(TrackEvent.Approved, trackId, {
            trackId,
            sourceStorage: state.sourceStorage,
            objectKey: state.sourceStorage.key,
            decision: 'approved',
            reason: result.reason,
            approvedAt: new Date().toISOString()
          })
        )
        .catch(() => undefined)
    } else {
      void this.events
        .emit(
          TrackEvent.Rejected,
          createEventEnvelope(TrackEvent.Rejected, trackId, {
            trackId,
            decision: 'rejected',
            reason: result.reason,
            rejectedAt: new Date().toISOString()
          })
        )
        .catch(() => undefined)
    }

    await this.idempotency.markProcessed(eventId)
  }
}
