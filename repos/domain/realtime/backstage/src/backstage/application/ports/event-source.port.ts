export interface PipelineEventInput {
  trackId: string
  eventType: string
  payload: Record<string, unknown>
}

export interface EventSourcePort {
  subscribe(handler: (event: PipelineEventInput) => Promise<void>): void
}
