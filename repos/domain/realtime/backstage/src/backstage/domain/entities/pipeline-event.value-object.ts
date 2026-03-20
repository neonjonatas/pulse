export interface PipelineEventProps {
  eventType: string
  timestamp: string
  payload: Record<string, unknown>
}

export class PipelineEvent {
  constructor(public readonly props: PipelineEventProps) {}

  get eventType(): string {
    return this.props.eventType
  }

  get timestamp(): string {
    return this.props.timestamp
  }

  get payload(): Record<string, unknown> {
    return this.props.payload
  }

  toJSON(): PipelineEventProps {
    return { ...this.props }
  }
}
