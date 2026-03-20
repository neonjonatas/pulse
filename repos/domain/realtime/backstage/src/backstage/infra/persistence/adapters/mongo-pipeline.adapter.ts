import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { TrackPipeline } from '@domain/entities'
import { PipelineRepositoryPort } from '@domain/repositories'
import { trackPipelineMapper } from '@infra/persistence/mappers/track-pipeline.mapper'
import type { TrackPipelineDoc } from '@infra/persistence'
import { TrackPipelineDocument } from '@infra/persistence/schemas/track-pipeline.schema'

@Injectable()
export class MongoPipelineAdapter implements PipelineRepositoryPort {
  constructor(
    @InjectModel(TrackPipelineDocument.name)
    private readonly model: Model<TrackPipelineDoc>
  ) {}

  async save(pipeline: TrackPipeline): Promise<void> {
    const doc = trackPipelineMapper.toPersistence(pipeline)
    await this.model.updateOne(
      { _id: pipeline.trackId },
      { $set: doc },
      { upsert: true }
    )
  }

  async findById(trackId: string): Promise<TrackPipeline | null> {
    const doc = await this.model.findById(trackId)
    if (!doc) return null
    return trackPipelineMapper.toDomain(doc)
  }

  async findActive(): Promise<TrackPipeline[]> {
    const docs = await this.model.find({ status: 'processing' }).exec()
    return docs.map((d) => trackPipelineMapper.toDomain(d))
  }

  async findFailed(): Promise<TrackPipeline[]> {
    const docs = await this.model.find({ status: 'failed' }).exec()
    return docs.map((d) => trackPipelineMapper.toDomain(d))
  }

  async findAll(): Promise<TrackPipeline[]> {
    const docs = await this.model.find().exec()
    return docs.map((d) => trackPipelineMapper.toDomain(d))
  }
}
