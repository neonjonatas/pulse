import { DomainEntity } from '@pack/kernel'
import { UniqueEntityId } from '@pack/patterns'

import { PipelineEvent } from './pipeline-event.value-object'

import { TrackEvent } from '@pack/event-inventory'
export interface TrackPipelineProps {
  trackId: string
  status: 'processing' | 'ready' | 'failed'
  currentStage: string
  events: PipelineEvent[]
  createdAt: Date
  updatedAt: Date
}

export class TrackPipeline extends DomainEntity<TrackPipelineProps> {
  private constructor(props: TrackPipelineProps, id?: UniqueEntityId) {
    super(props, id ?? UniqueEntityId.create())
  }

  static create(
    trackId: string,
    event: PipelineEvent,
    id?: UniqueEntityId
  ): TrackPipeline {
    const now = new Date()
    return new TrackPipeline(
      {
        trackId,
        status: 'processing',
        currentStage: event.eventType,
        events: [event],
        createdAt: now,
        updatedAt: now
      },
      id ?? UniqueEntityId.create(trackId)
    )
  }

  static reconstitute(
    props: TrackPipelineProps,
    id: UniqueEntityId
  ): TrackPipeline {
    return new TrackPipeline(props, id)
  }

  get trackId(): string {
    return this.props.trackId
  }

  get status(): TrackPipelineProps['status'] {
    return this.props.status
  }

  get currentStage(): string {
    return this.props.currentStage
  }

  get events(): PipelineEvent[] {
    return [...this.props.events]
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  appendEvent(event: PipelineEvent): void {
    this.props.events.push(event)
    this.props.currentStage = event.eventType
    this.props.updatedAt = new Date()

    if (event.eventType === TrackEvent.HlsStored) {
      this.props.status = 'ready'
    } else if (
      event.eventType === TrackEvent.UploadFailed ||
      event.eventType === TrackEvent.Rejected ||
      event.eventType === TrackEvent.PetrifiedFailed ||
      event.eventType === TrackEvent.FortMinorFailed ||
      event.eventType === TrackEvent.StereoFailed ||
      event.eventType === TrackEvent.TranscodingFailed
    ) {
      this.props.status = 'failed'
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this._id.toString(),
      trackId: this.props.trackId,
      status: this.props.status,
      currentStage: this.props.currentStage,
      events: this.props.events.map((e) => e.toJSON()),
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString()
    }
  }
}
