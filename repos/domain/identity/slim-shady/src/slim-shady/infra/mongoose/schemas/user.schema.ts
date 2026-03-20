import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

import type {
  AccountStatus,
  AudioQualityPreference,
  ThemePreference
} from '@domain/entities'

@Schema({
  _id: false,
  collection: 'users',
  timestamps: true
})
export class UserSchema {
  @Prop({ type: String, required: true })
  _id!: string

  @Prop({ type: String, required: true, unique: true, index: true })
  authId!: string

  @Prop({ type: String, required: true, lowercase: true, trim: true })
  email!: string

  @Prop({ type: String, unique: true, sparse: true, default: null })
  username!: string | null

  @Prop({
    type: Object,
    required: true
  })
  profile!: {
    displayName: string
    avatarUrl: string | null
    bio: string | null
  }

  @Prop({
    type: Object,
    required: true
  })
  preferences!: {
    theme: ThemePreference
    explicitContentFilter: boolean
    audioQuality: AudioQualityPreference
    privateSession: boolean
  }

  @Prop({ type: String, default: null })
  country!: string | null

  @Prop({ type: Object, required: true })
  account!: {
    status: AccountStatus
  }

  @Prop({ type: Object, required: true })
  onboarding!: {
    completed: boolean
    completedAt: Date | null
  }

  @Prop({ type: Date })
  createdAt!: Date

  @Prop({ type: Date })
  updatedAt!: Date
}

export interface UserDocument extends HydratedDocument<UserSchema> {}

export const UserSchemaName = UserSchema.name
export const UserSchemaDefinition = SchemaFactory.createForClass(UserSchema)
