import { Inject, Injectable } from '@nestjs/common'
import type {
  EventStreamPort,
  PipelineEventPayload
} from '../ports/event-stream.port'
import { EventStreamPortToken } from '../ports/event-stream.port'

@Injectable()
export class BroadcastPipelineEventUseCase {
  constructor(
    @Inject(EventStreamPortToken) private readonly stream: EventStreamPort
  ) {}

  async execute(input: {
    trackId: string
    eventType: string
    payload: Record<string, unknown>
  }): Promise<void> {
    const payload: PipelineEventPayload = {
      id: crypto.randomUUID(),
      type: 'pipeline.event',
      event: input.eventType,
      trackId: input.trackId,
      timestamp: new Date().toISOString(),
      payload: input.payload ?? {}
    }

    await this.stream.broadcast(payload)
  }
}
