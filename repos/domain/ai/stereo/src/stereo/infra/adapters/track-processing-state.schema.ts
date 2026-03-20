import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ collection: 'track_processing_states', timestamps: true })
export class TrackProcessingStateDocument extends Document {
  @Prop({
    type: {
      bucket: { type: String, required: true },
      key: { type: String, required: true }
    },
    default: null
  })
  sourceStorage!: { bucket: string; key: string } | null

  @Prop({ required: true, unique: true })
  trackId!: string

  @Prop({ default: false })
  fingerprintReady!: boolean

  @Prop({ type: String, default: null })
  fingerprintHash!: string | null

  @Prop({ type: String, default: null })
  audioHash!: string | null

  @Prop({ default: false })
  transcriptionReady!: boolean

  @Prop({ type: String, default: null })
  transcriptionText!: string | null

  @Prop({ type: String, default: null })
  transcriptionLanguage!: string | null

  @Prop({ type: Number, default: null })
  transcriptionDuration!: number | null

  @Prop({ default: false })
  stereoStarted!: boolean
}

export const TrackProcessingStateSchema = SchemaFactory.createForClass(
  TrackProcessingStateDocument
)
