export interface PipelineEventPayload {
  id: string
  type: 'pipeline.event'
  event: string
  trackId: string
  timestamp: string
  payload: {
    message?: string
    [key: string]: unknown
  }
}

export interface ReasoningMessage {
  id: string
  event: string
  message: string
  timestamp: string
  trackId: string
}
