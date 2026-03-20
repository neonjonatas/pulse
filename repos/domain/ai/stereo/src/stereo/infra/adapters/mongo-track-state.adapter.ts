import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Model } from 'mongoose'

import {
  TrackStatePort,
  type TrackProcessingState
} from 'src/stereo/application/ports/track-state.port'
import { TrackProcessingStateDocument } from './track-processing-state.schema'

/**
 * MongoDB-backed adapter for track processing state aggregation.
 * Stereo waits for both fingerprint and transcription signals before
 * running AI reasoning. This adapter tracks which signals have arrived
 * for each track and provides atomic upsert operations.
 */
@Injectable()
export class MongoTrackStateAdapter extends TrackStatePort {
  constructor(
    @InjectModel(TrackProcessingStateDocument.name)
    private readonly model: Model<TrackProcessingStateDocument>
  ) {
    super()
  }

  async findOrCreate(trackId: string): Promise<TrackProcessingState> {
    const doc = await this.model.findOneAndUpdate(
      { trackId },
      { $setOnInsert: { trackId } },
      { upsert: true, new: true }
    )
    return this.toState(doc!)
  }

  async markFingerprintReady(
    trackId: string,
    fingerprintHash: string,
    audioHash: string,
    sourceStorage: { bucket: string; key: string }
  ): Promise<TrackProcessingState> {
    const doc = await this.model.findOneAndUpdate(
      { trackId },
      {
        $set: {
          fingerprintReady: true,
          fingerprintHash,
          audioHash,
          sourceStorage
        }
      },
      { upsert: true, new: true }
    )
    return this.toState(doc!)
  }

  async markTranscriptionReady(
    trackId: string,
    text: string,
    language: string,
    duration: number
  ): Promise<TrackProcessingState> {
    const doc = await this.model.findOneAndUpdate(
      { trackId },
      {
        $set: {
          transcriptionReady: true,
          transcriptionText: text,
          transcriptionLanguage: language,
          transcriptionDuration: duration
        }
      },
      { upsert: true, new: true }
    )
    return this.toState(doc!)
  }

  async markStereoStarted(trackId: string): Promise<void> {
    await this.model.updateOne(
      { trackId },
      { $set: { stereoStarted: true } },
      { writeConcern: { w: 'majority' } }
    )
  }

  private toState(doc: TrackProcessingStateDocument): TrackProcessingState {
    return {
      trackId: doc.trackId,
      fingerprintReady: doc.fingerprintReady,
      fingerprintHash: doc.fingerprintHash,
      audioHash: doc.audioHash,
      sourceStorage: doc.sourceStorage ?? null,
      transcriptionReady: doc.transcriptionReady,
      transcriptionText: doc.transcriptionText,
      transcriptionLanguage: doc.transcriptionLanguage,
      transcriptionDuration: doc.transcriptionDuration,
      stereoStarted: doc.stereoStarted
    }
  }
}
