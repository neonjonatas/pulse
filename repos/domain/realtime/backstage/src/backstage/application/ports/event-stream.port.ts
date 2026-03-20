export const EventStreamPortToken = Symbol('EVENT_STREAM_PORT')

export interface PipelineEventPayload {
  id: string
  type: 'pipeline.event'
  event: string
  trackId: string
  timestamp: string
  payload: Record<string, unknown>
}

export interface EventStreamPort {
  broadcast(event: PipelineEventPayload): Promise<void>
}
