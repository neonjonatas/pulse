import type {
  EventStreamPort,
  PipelineEventPayload
} from '../../application/ports/event-stream.port'
import type { PipelineGateway } from '../../interface/gateways/pipeline.gateway'

export class SocketIOEventStreamAdapter implements EventStreamPort {
  constructor(private readonly gateway: PipelineGateway) {}

  async broadcast(event: PipelineEventPayload): Promise<void> {
    if (this.gateway.server) {
      this.gateway.server.emit('pipeline.event', event)
    }
  }
}
