import { Injectable } from '@nestjs/common'
import { UseCase } from '@pack/kernel'

import { TrackPipeline } from '@domain/entities'
import { PipelineRepositoryPort } from '@domain/repositories'

@Injectable()
export class GetTrackPipelineUseCase extends UseCase<
  string,
  TrackPipeline | null
> {
  constructor(private readonly repository: PipelineRepositoryPort) {
    super()
  }

  async execute(trackId: string): Promise<TrackPipeline | null> {
    return this.repository.findById(trackId)
  }
}
