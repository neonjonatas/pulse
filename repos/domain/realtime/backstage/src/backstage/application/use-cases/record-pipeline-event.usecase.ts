import { Injectable } from '@nestjs/common'
import { UseCase } from '@pack/kernel'

import { PipelineEvent, TrackPipeline } from '@domain/entities'
import { PipelineRepositoryPort } from '@domain/repositories'

export interface RecordPipelineEventInput {
  eventType: string
  trackId: string
  payload: Record<string, unknown>
}

@Injectable()
export class RecordPipelineEventUseCase extends UseCase<
  RecordPipelineEventInput,
  void
> {
  constructor(private readonly repository: PipelineRepositoryPort) {
    super()
  }

  async execute(input: RecordPipelineEventInput): Promise<void> {
    const event = new PipelineEvent({
      eventType: input.eventType,
      timestamp: new Date().toISOString(),
      payload: input.payload
    })

    let pipeline = await this.repository.findById(input.trackId)

    if (!pipeline) {
      pipeline = TrackPipeline.create(input.trackId, event)
    } else {
      pipeline.appendEvent(event)
    }

    await this.repository.save(pipeline)
  }
}
