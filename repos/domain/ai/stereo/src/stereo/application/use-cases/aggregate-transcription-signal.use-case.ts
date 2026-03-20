import { Injectable } from '@nestjs/common'

import { UseCase } from '@pack/kernel'

import { TrackStatePort } from 'src/stereo/application/ports/track-state.port'

export interface AggregateTranscriptionInput {
  trackId: string
  text: string
  language: string
  durationInSeconds: number
}

/// Stores the transcription signal so stereo can proceed once both signals
/// are available.
@Injectable()
export class AggregateTranscriptionSignalUseCase extends UseCase<
  AggregateTranscriptionInput,
  void
> {
  constructor(private readonly trackState: TrackStatePort) {
    super()
  }

  async execute(input: AggregateTranscriptionInput): Promise<void> {
    await this.trackState.markTranscriptionReady(
      input.trackId,
      input.text,
      input.language,
      input.durationInSeconds
    )
  }
}
