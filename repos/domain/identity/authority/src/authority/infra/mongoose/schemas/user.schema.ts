import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema({
  _id: false,
  collection: 'users',
  timestamps: true
})
export class User {
  @Prop({ type: String, required: true })
  _id!: string

  @Prop({ required: true, unique: true })
  email!: string

  @Prop({ type: String, default: null })
  passwordHash!: string | null

  @Prop({ type: String, required: true, index: true })
  provider!: string

  @Prop({ type: String, index: true, default: null })
  providerUserId!: string | null

  @Prop({ type: String, default: null })
  name!: string | null

  @Prop({ type: String, default: null, index: true })
  profileId!: string | null

  @Prop({ type: Date })
  createdAt!: Date

  @Prop({ type: Date })
  updatedAt!: Date
}

export interface UserDocument extends HydratedDocument<User> {}

export const UserSchemaDefinition = SchemaFactory.createForClass(User)

UserSchemaDefinition.index(
  { provider: 1, providerUserId: 1 },
  {
    unique: true,
    partialFilterExpression: { providerUserId: { $type: 'string' } }
  }
)
