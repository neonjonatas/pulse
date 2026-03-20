export interface TrackProcessingState {
  trackId: string
  fingerprintReady: boolean
  fingerprintHash: string | null
  audioHash: string | null
  sourceStorage: {
    bucket: string
    key: string
  } | null
  transcriptionReady: boolean
  transcriptionText: string | null
  transcriptionLanguage: string | null
  transcriptionDuration: number | null
  stereoStarted: boolean
}

/// Port for managing the event-join state of a track through the pipeline.
export abstract class TrackStatePort {
  abstract findOrCreate(trackId: string): Promise<TrackProcessingState>
  abstract markFingerprintReady(
    trackId: string,
    fingerprintHash: string,
    audioHash: string,
    storage: {
      bucket: string
      key: string
    }
  ): Promise<TrackProcessingState>
  abstract markTranscriptionReady(
    trackId: string,
    text: string,
    language: string,
    duration: number
  ): Promise<TrackProcessingState>
  abstract markStereoStarted(trackId: string): Promise<void>
}
