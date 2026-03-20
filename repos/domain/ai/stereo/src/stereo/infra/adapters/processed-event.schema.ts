import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ collection: 'processed_events' })
export class ProcessedEventDocument extends Document {
  @Prop({ required: true, unique: true })
  eventId!: string

  @Prop({ default: () => new Date() })
  processedAt!: Date
}

export const ProcessedEventSchema = SchemaFactory.createForClass(
  ProcessedEventDocument
)
