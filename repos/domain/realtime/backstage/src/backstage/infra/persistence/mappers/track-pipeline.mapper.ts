import { UniqueEntityId } from '@pack/patterns'

import { PipelineEvent, TrackPipeline } from '@domain/entities'
import type { TrackPipelineDoc } from '@infra/persistence/schemas/track-pipeline.schema'

export const trackPipelineMapper = {
  toDomain(doc: TrackPipelineDoc): TrackPipeline {
    const id = UniqueEntityId.create(doc._id.toString())
    const events = doc.events.map(
      (e) =>
        new PipelineEvent({
          eventType: e.eventType,
          timestamp: e.timestamp,
          payload: (e.payload ?? {}) as Record<string, unknown>
        })
    )

    return TrackPipeline.reconstitute(
      {
        trackId: doc.trackId,
        status: doc.status as 'processing' | 'ready' | 'failed',
        currentStage: doc.currentStage,
        events,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      },
      id
    )
  },

  toPersistence(pipeline: TrackPipeline) {
    const json = pipeline.toJSON()
    const events = (json.events ?? []) as Array<{
      eventType: string
      timestamp: string
      payload: Record<string, unknown>
    }>
    return {
      _id: pipeline.trackId,
      trackId: json.trackId as string,
      status: json.status as string,
      currentStage: json.currentStage as string,
      events: events.map((e) => ({
        eventType: e.eventType,
        timestamp: e.timestamp,
        payload: e.payload ?? {}
      })),
      createdAt: new Date(json.createdAt as string),
      updatedAt: new Date(json.updatedAt as string)
    }
  }
}
