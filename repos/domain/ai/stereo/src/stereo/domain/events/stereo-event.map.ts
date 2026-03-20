import { TrackEvent } from '@pack/event-inventory'

/// Events consumed by the stereo module (inbound).
export type StereoInboundEventMap = {
  [TrackEvent.PetrifiedGenerated]: {
    trackId: string
    fingerprintHash: string
    audioHash: string
    storage: { bucket: string; key: string }
    generatedAt: string
  }
  [TrackEvent.FortMinorCompleted]: {
    trackId: string
    language: string
    text: string
    segments: Array<{ start: number; end: number; text: string }>
    durationInSeconds: number
    completedAt: string
  }
}

/// Events emitted by the stereo module (outbound).
export type StereoEventMap = {
  [TrackEvent.StereoStarted]: {
    trackId: string
    startedAt: string
  }
  [TrackEvent.Approved]: {
    trackId: string
    sourceStorage: {
      bucket: string
      key: string
    }
    objectKey: string
    decision: 'approved'
    reason: string
    approvedAt: string
  }
  [TrackEvent.Rejected]: {
    trackId: string
    decision: 'rejected'
    reason: string
    rejectedAt: string
  }
  [TrackEvent.StereoFailed]: {
    trackId: string
    errorCode: string
    message: string
  }
}
