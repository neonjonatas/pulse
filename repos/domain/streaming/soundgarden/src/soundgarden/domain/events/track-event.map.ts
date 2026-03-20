import { TrackEvent } from '@pack/event-inventory'
export type TrackEventMap = {
  [TrackEvent.UploadReceived]: {
    trackId: string
    fileName: string
    receivedAt: string
  }
  [TrackEvent.UploadValidated]: {
    trackId: string
    fileName: string
    fileSize: number
    mimeType: string
    validatedAt: string
  }
  [TrackEvent.UploadStored]: {
    trackId: string
    filePath: string
    fileName: string
    fileSize: number
    storedAt: string
  }
  [TrackEvent.Uploaded]: {
    trackId: string
    filePath: string
    fileName: string
    fileSize: number
    mimeType: string
    soundgardenStorage?: {
      bucket: string
      key: string
    }
    sourceStorage: {
      bucket: string
      key: string
    }
    petrifiedStorage: {
      bucket: string
      key: string
    }
    fortMinorStorage: {
      bucket: string
      key: string
    }
    /** @deprecated Use petrifiedStorage */
    storage?: {
      bucket: string
      key: string
    }
    /** @deprecated Use fortMinorStorage */
    transcriptionStorage?: {
      bucket: string
      key: string
    }
    uploadedAt: string
  }
  [TrackEvent.UploadFailed]: {
    trackId: string
    errorCode: string
    message: string
  }
}
