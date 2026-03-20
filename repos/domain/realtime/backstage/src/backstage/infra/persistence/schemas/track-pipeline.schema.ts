import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

const PipelineEventSchema = {
  eventType: { type: String, required: true },
  timestamp: { type: String, required: true },
  payload: { type: Object, default: {} }
}

@Schema({
  collection: 'track_pipelines',
  timestamps: true
})
export class TrackPipelineDocument {
  @Prop({ type: String, required: true })
  _id!: string

  @Prop({ type: String, required: true, index: true })
  trackId!: string

  @Prop({ type: String, required: true, index: true })
  status!: string

  @Prop({ type: String, required: true, index: true })
  currentStage!: string

  @Prop({ type: [PipelineEventSchema], default: [] })
  events!: Array<{
    eventType: string
    timestamp: string
    payload: Record<string, unknown>
  }>

  @Prop({ type: Date })
  createdAt!: Date

  @Prop({ type: Date })
  updatedAt!: Date
}

export type TrackPipelineDoc = HydratedDocument<TrackPipelineDocument>

export const TrackPipelineSchemaDefinition = SchemaFactory.createForClass(
  TrackPipelineDocument
)
