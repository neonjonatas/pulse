/** Payload emitted when a track pipeline is detected as stalled. */
export interface TrackStuckPayload {
  trackId: string
  lastStage: string
  expectedNextStage: string
  stuckSinceMs: number
  timestamp: string
}

/** Payload emitted when a service fails its health check. */
export interface ServiceUnhealthyPayload {
  service: string
  url: string
  error: string
  timestamp: string
}

/** Payload emitted when an anomaly is detected in the event pipeline. */
export interface PipelineAnomalyPayload {
  trackId: string
  anomalyType: 'gap' | 'out_of_order' | 'duplicate_event' | 'timeout'
  description: string
  timestamp: string
}

/** Payload emitted when the debug pipeline completes a diagnosis. */
export interface DiagnosisReadyPayload {
  trackId: string
  diagnosis: {
    currentStage: string
    status: string
    summary: string
    suggestedAction: string
  }
  timestamp: string
}

/** Maps signal names to their typed payloads for the Shinoda signal bus. */
export interface ShinodaEventMap {
  TRACK_STUCK: TrackStuckPayload
  SERVICE_UNHEALTHY: ServiceUnhealthyPayload
  PIPELINE_ANOMALY: PipelineAnomalyPayload
  DIAGNOSIS_READY: DiagnosisReadyPayload
}

export type ShinodaEventName = keyof ShinodaEventMap
