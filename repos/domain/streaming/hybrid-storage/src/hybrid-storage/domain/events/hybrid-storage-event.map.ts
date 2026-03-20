import { TrackEvent } from '@pack/event-inventory'

export type HybridStorageEventMap = {
  [TrackEvent.HlsGenerated]: {
    trackId: string
    masterPlaylist: string
    variants: Array<{
      bitrate: number
      playlist: string
      segmentsDir: string
    }>
    generatedAt: string
  }
  [TrackEvent.HlsStored]: {
    trackId: string
    baseKey: string
    manifestKey: string
    storedAt: string
  }
  [TrackEvent.HlsFailed]: {
    trackId: string
    errorCode: string
    message: string
  }
}
