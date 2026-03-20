import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { User } from '@domain/entities'
import { UserPort } from '@domain/ports'
import { type UserDocument, UserSchemaName, userMapper } from '@infra/mongoose'

@Injectable()
export class MongooseUserAdapter implements UserPort {
  constructor(
    @InjectModel(UserSchemaName)
    private readonly model: Model<UserDocument>
  ) {}

  async create(user: User): Promise<void> {
    const data = userMapper.toPersistence(user)
    await this.model.create(data)
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.model.findById(id)

    if (!doc) return null

    return userMapper.toDomain(doc)
  }

  async findByAuthId(authId: string): Promise<User | null> {
    const doc = await this.model.findOne({ authId })

    if (!doc) return null

    return userMapper.toDomain(doc)
  }

  async findByUsername(username: string): Promise<User | null> {
    const doc = await this.model.findOne({ username })

    if (!doc) return null

    return userMapper.toDomain(doc)
  }

  async update(user: User): Promise<void> {
    const data = userMapper.toPersistence(user)
    await this.model.findByIdAndUpdate(user.idString, data, { upsert: false })
  }
}
