import { Inject, Injectable } from '@nestjs/common'
import { uuidv7 } from 'uuidv7'
import { UseCase } from '@pack/kernel'

import {
  FileStoragePort,
  FileValidatorPort,
  ObjectStoragePort,
  TrackEventBusPort
} from '@domain/ports'
import { TrackEvent } from '@pack/event-inventory'
import type {
  StoredFileInfo,
  UploadedStorageRefs,
  ValidationFailure
} from '@domain/ports'
import { createEventEnvelope } from '@domain/events'

import {
  UPLOAD_MAX_SIZE_BYTES,
  UPLOAD_STORAGE_BUCKET,
  UPLOAD_STORAGE_PATH
} from '@infra/upload-config.provider'

export interface UploadTrackInput {
  file: Express.Multer.File
}

export interface UploadTrackResult {
  trackId: string
  status: 'uploaded'
}

@Injectable()
export class UploadTrackUseCase extends UseCase<
  UploadTrackInput,
  UploadTrackResult
> {
  constructor(
    @Inject(TrackEventBusPort)
    private readonly events: TrackEventBusPort,
    private readonly validator: FileValidatorPort,
    private readonly storage: FileStoragePort,
    private readonly objectStorage: ObjectStoragePort,
    @Inject(UPLOAD_MAX_SIZE_BYTES)
    private readonly maxSizeBytes: number,
    @Inject(UPLOAD_STORAGE_PATH)
    private readonly storagePath: string,
    @Inject(UPLOAD_STORAGE_BUCKET)
    private readonly storageBucket: string
  ) {
    super()
  }

  async execute(input: UploadTrackInput): Promise<UploadTrackResult> {
    const { file } = input
    const trackId = uuidv7()

    void this.events
      .emit(
        TrackEvent.UploadReceived,
        createEventEnvelope(TrackEvent.UploadReceived, trackId, {
          trackId,
          fileName: file.originalname,
          receivedAt: new Date().toISOString()
        })
      )
      .catch(() => undefined)

    const validation = await this.validator.validate(file, this.maxSizeBytes)

    if (!validation.success) {
      const failure = validation as ValidationFailure
      void this.events
        .emit(
          TrackEvent.UploadFailed,
          createEventEnvelope(TrackEvent.UploadFailed, trackId, {
            trackId,
            errorCode: failure.errorCode,
            message: failure.message
          })
        )
        .catch(() => undefined)
      throw new UploadValidationError(failure.errorCode, failure.message)
    }

    void this.events
      .emit(
        TrackEvent.UploadValidated,
        createEventEnvelope(TrackEvent.UploadValidated, trackId, {
          trackId,
          fileName: file.originalname,
          fileSize: validation.fileSize,
          mimeType: validation.mimeType,
          validatedAt: new Date().toISOString()
        })
      )
      .catch(() => undefined)

    let stored: StoredFileInfo
    try {
      stored = await this.storage.store(trackId, file, this.storagePath)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Storage operation failed'
      void this.events
        .emit(
          TrackEvent.UploadFailed,
          createEventEnvelope(TrackEvent.UploadFailed, trackId, {
            trackId,
            errorCode: 'STORAGE_FAILED',
            message
          })
        )
        .catch(() => undefined)
      throw new UploadStorageError(message)
    }

    void this.events
      .emit(
        TrackEvent.UploadStored,
        createEventEnvelope(TrackEvent.UploadStored, trackId, {
          trackId,
          filePath: stored.filePath,
          fileName: stored.fileName,
          fileSize: stored.fileSize,
          storedAt: new Date().toISOString()
        })
      )
      .catch(() => undefined)

    // Object storage upload is required for downstream pipeline stages.
    let storageRefs: UploadedStorageRefs = {}
    try {
      storageRefs = await this.objectStorage.upload(
        trackId,
        stored.fileName,
        this.storageBucket,
        file.buffer,
        validation.mimeType
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Object storage upload failed'
      void this.events
        .emit(
          TrackEvent.UploadFailed,
          createEventEnvelope(TrackEvent.UploadFailed, trackId, {
            trackId,
            errorCode: 'OBJECT_STORAGE_FAILED',
            message
          })
        )
        .catch(() => undefined)
      throw new UploadStorageError(message)
    }

    const petrifiedRef = storageRefs.petrified ?? storageRefs.fingerprint
    const fortMinorRef = storageRefs.fortMinor ?? storageRefs.transcription
    const soundgardenRef = storageRefs.soundgarden

    if (!petrifiedRef || !fortMinorRef) {
      const message =
        'Missing canonical storage refs (petrifiedStorage and fortMinorStorage are required)'
      void this.events
        .emit(
          TrackEvent.UploadFailed,
          createEventEnvelope(TrackEvent.UploadFailed, trackId, {
            trackId,
            errorCode: 'CANONICAL_STORAGE_REFS_MISSING',
            message
          })
        )
        .catch(() => undefined)
      throw new UploadStorageError(message)
    }

    const sourceStorage = soundgardenRef ?? petrifiedRef

    void this.events
      .emit(
        TrackEvent.Uploaded,
        createEventEnvelope(TrackEvent.Uploaded, trackId, {
          trackId,
          filePath: stored.filePath,
          fileName: stored.fileName,
          fileSize: stored.fileSize,
          mimeType: validation.mimeType,
          ...(soundgardenRef && {
            soundgardenStorage: soundgardenRef
          }),
          sourceStorage,
          petrifiedStorage: petrifiedRef,
          fortMinorStorage: fortMinorRef,
          storage: petrifiedRef,
          transcriptionStorage: fortMinorRef,
          uploadedAt: new Date().toISOString()
        })
      )
      .catch(() => undefined)

    return { trackId, status: 'uploaded' }
  }
}

export class UploadValidationError extends Error {
  constructor(
    public readonly errorCode: string,
    message: string
  ) {
    super(message)
    this.name = 'UploadValidationError'
  }
}

export class UploadStorageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UploadStorageError'
  }
}
