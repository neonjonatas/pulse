import { TrackEvent } from '@pack/event-inventory'

export type PetrifiedGeneratedEventMap = {
  [TrackEvent.PetrifiedGenerated]: {
    trackId: string
    fingerprintHash: string
    audioHash: string
    storage: { bucket: string; key: string }
    generatedAt: string
  }
}

/// Events emitted by the fort-minor module (outbound).
export type FortMinorEventMap = {
  [TrackEvent.FortMinorStarted]: {
    trackId: string
    startedAt: string
  }
  [TrackEvent.FortMinorCompleted]: {
    trackId: string
    language: string
    text: string
    segments: Array<{ start: number; end: number; text: string }>
    durationInSeconds: number
    completedAt: string
  }
  [TrackEvent.FortMinorFailed]: {
    trackId: string
    errorCode: string
    message: string
  }
}
