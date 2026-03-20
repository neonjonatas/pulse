import { Controller, Headers, Param, Req, Sse } from '@nestjs/common'
import {
  Observable,
  concat,
  interval,
  map,
  merge,
  from,
  mergeMap,
  EMPTY
} from 'rxjs'

import { GetTrackPipelineUseCase } from '@application/use-cases'
import { SseStreamRegistry } from '@infra/sse/sse-stream.registry'

const HEARTBEAT_INTERVAL_MS = 15_000

@Controller('pipelines')
export class SsePipelineController {
  constructor(
    private readonly registry: SseStreamRegistry,
    private readonly getTrackPipeline: GetTrackPipelineUseCase
  ) {}

  @Sse(':trackId/events')
  events(
    @Param('trackId') trackId: string,
    @Headers('last-event-id') lastEventId: string | undefined,
    @Req() req: { on: (event: string, cb: () => void) => void }
  ): Observable<MessageEvent> {
    const { stream$, unregister } = this.registry.register(trackId)
    req.on('close', unregister)

    const replay$ = this.replayPastEvents(trackId, lastEventId)
    const heartbeat$ = this.createHeartbeat()

    return concat(replay$, merge(stream$, heartbeat$))
  }

  private replayPastEvents(
    trackId: string,
    _lastEventId: string | undefined
  ): Observable<MessageEvent> {
    return from(this.getTrackPipeline.execute(trackId)).pipe(
      mergeMap((pipeline) => {
        if (!pipeline) return EMPTY

        const events = pipeline.events.map((event) => {
          const payload = {
            id: crypto.randomUUID(),
            type: 'pipeline.event' as const,
            event: event.eventType,
            trackId,
            timestamp: event.timestamp,
            payload: event.payload
          }

          return new MessageEvent('pipeline.event', {
            data: JSON.stringify(payload),
            lastEventId: payload.id
          })
        })

        return from(events)
      })
    )
  }

  private createHeartbeat(): Observable<MessageEvent> {
    return interval(HEARTBEAT_INTERVAL_MS).pipe(
      map(() => new MessageEvent('heartbeat', { data: '' }))
    )
  }
}
