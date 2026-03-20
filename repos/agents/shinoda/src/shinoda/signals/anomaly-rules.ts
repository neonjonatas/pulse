import { signalBus } from './signal-bus'

import { TrackEvent } from '@pack/event-inventory'
const EXPECTED_SEQUENCE: string[] = [
  TrackEvent.Uploaded,
  TrackEvent.PetrifiedGenerated,
  TrackEvent.FortMinorStarted,
  TrackEvent.FortMinorCompleted,
  TrackEvent.StereoStarted,
  TrackEvent.Approved,
  TrackEvent.HlsGenerated,
  TrackEvent.HlsStored
]

const TERMINAL_EVENTS: string[] = [
  TrackEvent.Rejected,
  TrackEvent.DuplicateDetected,
  TrackEvent.PetrifiedFailed,
  TrackEvent.FortMinorFailed,
  TrackEvent.StereoFailed
]

interface PipelineState {
  trackId: string
  status: 'processing' | 'ready' | 'failed'
  currentStage: string
  events: Array<{ eventType: string; timestamp: string }>
  updatedAt: string
}

export function stuckTrackRule(
  pipeline: PipelineState,
  thresholdMs: number = 60_000
): void {
  if (pipeline.status !== 'processing') return

  const elapsed = Date.now() - new Date(pipeline.updatedAt).getTime()
  if (elapsed < thresholdMs) return

  const observedTypes = new Set(pipeline.events.map((e) => e.eventType))
  let expectedNext: string = TrackEvent.Uploaded

  for (let i = 0; i < EXPECTED_SEQUENCE.length - 1; i++) {
    if (observedTypes.has(EXPECTED_SEQUENCE[i])) {
      expectedNext = EXPECTED_SEQUENCE[i + 1]
    }
  }

  signalBus.emit('TRACK_STUCK', {
    trackId: pipeline.trackId,
    lastStage: pipeline.currentStage,
    expectedNextStage: expectedNext,
    stuckSinceMs: elapsed,
    timestamp: new Date().toISOString()
  })
}

export function eventGapRule(pipeline: PipelineState): void {
  const observedTypes = new Set(pipeline.events.map((e) => e.eventType))

  const hasTerminal = pipeline.events.some((e) =>
    TERMINAL_EVENTS.includes(e.eventType)
  )
  if (hasTerminal) return

  for (let i = 0; i < EXPECTED_SEQUENCE.length - 1; i++) {
    const current = EXPECTED_SEQUENCE[i]
    const next = EXPECTED_SEQUENCE[i + 1]

    if (observedTypes.has(current) && !observedTypes.has(next)) {
      signalBus.emit('PIPELINE_ANOMALY', {
        trackId: pipeline.trackId,
        anomalyType: 'gap',
        description: `Expected "${next}" after "${current}" but it was not observed`,
        timestamp: new Date().toISOString()
      })
      break
    }
  }
}

export function outOfOrderRule(pipeline: PipelineState): void {
  const events = pipeline.events
  let lastSeqIndex = -1

  for (const event of events) {
    const seqIndex = EXPECTED_SEQUENCE.indexOf(event.eventType)
    if (seqIndex === -1) continue

    if (seqIndex < lastSeqIndex) {
      signalBus.emit('PIPELINE_ANOMALY', {
        trackId: pipeline.trackId,
        anomalyType: 'out_of_order',
        description: `Event "${event.eventType}" arrived after a later-stage event`,
        timestamp: new Date().toISOString()
      })
      return
    }
    lastSeqIndex = seqIndex
  }
}

export function serviceHealthRule(
  serviceName: string,
  serviceUrl: string,
  error: string
): void {
  signalBus.emit('SERVICE_UNHEALTHY', {
    service: serviceName,
    url: serviceUrl,
    error,
    timestamp: new Date().toISOString()
  })
}

export function evaluateAllRules(
  pipeline: PipelineState,
  stuckThresholdMs?: number
): void {
  stuckTrackRule(pipeline, stuckThresholdMs)
  eventGapRule(pipeline)
  outOfOrderRule(pipeline)
}
