import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { User } from '@domain/entities'
import { UserPort } from '@domain/ports'
import { Email } from '@domain/value-objects'
import { userMapper } from '../mappers/user.mapper'
import { type UserDocument, User as UserSchema } from '../schemas/user.schema'

@Injectable()
export class MongooseUserAdapter implements UserPort {
  constructor(
    @InjectModel(UserSchema.name)
    private readonly model: Model<UserDocument>
  ) {}

  async findByEmail(email: Email): Promise<User | null> {
    const doc = await this.model.findOne({ email: email.toString() })

    if (!doc) return null

    return userMapper.toDomain(doc)
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.model.findById(id)

    if (!doc) return null

    return userMapper.toDomain(doc)
  }

  async create(user: User): Promise<void> {
    const data = userMapper.toPersistence(user)
    await this.model.create(data)
  }

  async updateProfileId(userId: string, profileId: string): Promise<void> {
    await this.model.findByIdAndUpdate(userId, { profileId }, { upsert: false })
  }
}
