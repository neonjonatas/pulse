import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Session } from '@domain/entities'
import { SessionPort } from '@domain/ports'
import { sessionMapper } from '../mappers/session.mapper'
import {
  type SessionDocument,
  Session as SessionSchema
} from '../schemas/session.schema'

@Injectable()
export class MongooseSessionAdapter implements SessionPort {
  constructor(
    @InjectModel(SessionSchema.name)
    private readonly model: Model<SessionDocument>
  ) {}

  async create(session: Session): Promise<void> {
    const data = sessionMapper.toPersistence(session)
    await this.model.create(data)
  }

  async findById(id: string): Promise<Session | null> {
    const doc = await this.model.findById(id)

    if (!doc) return null

    return sessionMapper.toDomain(doc)
  }

  async update(session: Session): Promise<void> {
    const data = sessionMapper.toPersistence(session)
    await this.model.updateOne({ _id: session.idString }, data)
  }

  async deleteById(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id })
  }
}
