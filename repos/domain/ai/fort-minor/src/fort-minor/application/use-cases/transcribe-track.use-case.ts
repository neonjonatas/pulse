import { Inject, Injectable } from '@nestjs/common'

import { UseCase } from '@pack/kernel'

import { AudioStoragePort } from '@domain/ports/audio-storage.port'
import { TrackEvent } from '@pack/event-inventory'
import {
  IdempotencyPort,
  FortMinorEventBusPort,
  TranscriberPort
} from '@application/ports'
import { createEventEnvelope } from '@domain/events'

export interface TranscribeTrackInput {
  eventId: string
  trackId: string
  storage: { bucket: string; key: string }
}

@Injectable()
export class TranscribeTrackUseCase extends UseCase<
  TranscribeTrackInput,
  void
> {
  @Inject(FortMinorEventBusPort)
  private readonly events!: FortMinorEventBusPort

  @Inject(AudioStoragePort)
  private readonly audioStorage!: AudioStoragePort

  @Inject(TranscriberPort)
  private readonly transcriber!: TranscriberPort

  @Inject(IdempotencyPort)
  private readonly idempotency!: IdempotencyPort

  async execute(input: TranscribeTrackInput): Promise<void> {
    const { eventId, trackId, storage } = input

    if (await this.idempotency.hasProcessed(eventId)) return

    void this.events.emit(
      TrackEvent.FortMinorStarted,
      createEventEnvelope(TrackEvent.FortMinorStarted, trackId, {
        trackId,
        startedAt: new Date().toISOString()
      })
    )

    const downloaded = await this.audioStorage.download(
      storage.bucket,
      storage.key
    )

    try {
      let result: Awaited<ReturnType<TranscriberPort['transcribe']>>

      try {
        result = await this.transcriber.transcribe(downloaded.filePath)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Transcription failed'
        void this.events
          .emit(
            TrackEvent.FortMinorFailed,
            createEventEnvelope(TrackEvent.FortMinorFailed, trackId, {
              trackId,
              errorCode: 'FORT_MINOR_FAILED',
              message
            })
          )
          .catch(() => undefined)
        return
      }

      void this.events
        .emit(
          TrackEvent.FortMinorCompleted,
          createEventEnvelope(TrackEvent.FortMinorCompleted, trackId, {
            trackId,
            language: result.language,
            text: result.text,
            segments: result.segments,
            durationInSeconds: result.durationInSeconds,
            completedAt: new Date().toISOString()
          })
        )
        .catch(() => undefined)

      await this.idempotency.markProcessed(eventId)
    } finally {
      await downloaded.cleanup()
    }
  }
}
