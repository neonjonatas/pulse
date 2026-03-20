import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema({
  _id: false,
  collection: 'sessions',
  timestamps: true
})
export class Session {
  @Prop({ type: String, required: true })
  _id!: string

  @Prop({ type: String, required: true, index: true })
  userId!: string

  @Prop({ type: String, required: true })
  refreshTokenHash!: string

  @Prop({ type: Date, required: true, index: true, expires: 0 })
  expiresAt!: Date

  @Prop({ type: String, default: null })
  ipAddress!: string | null

  @Prop({ type: String, default: null })
  userAgent!: string | null

  @Prop({ type: String, required: true })
  provider!: string

  @Prop({ type: Date })
  createdAt!: Date

  @Prop({ type: Date })
  updatedAt!: Date
}

export interface SessionDocument extends HydratedDocument<Session> {}

export const SessionSchemaDefinition = SchemaFactory.createForClass(Session)
