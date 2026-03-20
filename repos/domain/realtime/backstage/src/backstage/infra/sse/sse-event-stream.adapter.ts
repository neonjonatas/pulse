import type {
  EventStreamPort,
  PipelineEventPayload
} from '../../application/ports/event-stream.port'
import type { SseStreamRegistry } from './sse-stream.registry'

export class SseEventStreamAdapter implements EventStreamPort {
  constructor(private readonly registry: SseStreamRegistry) {}

  async broadcast(event: PipelineEventPayload): Promise<void> {
    const id = event.id ?? crypto.randomUUID()
    const sseEvent = new MessageEvent('pipeline.event', {
      data: JSON.stringify(event),
      lastEventId: id
    })
    this.registry.emit(event.trackId, sseEvent)
  }
}
