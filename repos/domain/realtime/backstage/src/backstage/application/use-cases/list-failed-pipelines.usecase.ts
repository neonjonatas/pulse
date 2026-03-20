import { Injectable } from '@nestjs/common'
import { UseCase } from '@pack/kernel'

import { TrackPipeline } from '@domain/entities'
import { PipelineRepositoryPort } from '@domain/repositories'

@Injectable()
export class ListFailedPipelinesUseCase extends UseCase<void, TrackPipeline[]> {
  constructor(private readonly repository: PipelineRepositoryPort) {
    super()
  }

  async execute(): Promise<TrackPipeline[]> {
    return this.repository.findFailed()
  }
}
