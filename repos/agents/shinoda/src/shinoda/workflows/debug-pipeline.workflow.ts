import { createWorkflow, createStep } from '@mastra/core/workflows'
import { z } from 'zod'
import axios from 'axios'

import { requireStringEnv } from '@pack/env-orchestration'
import { TrackEvent } from '@pack/event-inventory'
import { signalBus } from '../signals/signal-bus'

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

const STAGE_OWNERS: Record<string, string> = {
  [TrackEvent.Uploaded]: 'Soundgarden',
  [TrackEvent.PetrifiedGenerated]: 'Petrified',
  [TrackEvent.FortMinorStarted]: 'Fort Minor',
  [TrackEvent.FortMinorCompleted]: 'Fort Minor',
  [TrackEvent.StereoStarted]: 'Stereo',
  [TrackEvent.Approved]: 'Stereo',
  [TrackEvent.HlsGenerated]: 'Mockingbird',
  [TrackEvent.HlsStored]: 'Hybrid Storage'
}

const SERVICE_HEALTH_URLS: Record<string, string> = {
  Authority: requireStringEnv('AUTHORITY_URL'),
  'Slim Shady': requireStringEnv('SLIM_SHADY_URL'),
  Soundgarden: requireStringEnv('SOUNDGARDEN_URL'),
  Petrified: requireStringEnv('PETRIFIED_URL'),
  'Fort Minor': requireStringEnv('FORT_MINOR_URL'),
  Stereo: requireStringEnv('STEREO_URL'),
  Mockingbird: requireStringEnv('MOCKINGBIRD_URL'),
  'Hybrid Storage': requireStringEnv('HYBRID_STORAGE_URL'),
  Backstage: requireStringEnv('BACKSTAGE_URL')
}

interface PipelineEvent {
  eventType: string
  timestamp: string
  payload: Record<string, unknown>
}

interface PipelineData {
  trackId: string
  status: string
  currentStage: string
  events: PipelineEvent[]
  createdAt: string
  updatedAt: string
}

type ServiceHealthMap = Record<string, 'healthy' | 'unhealthy' | 'unreachable'>

const inputSchema = z.object({ trackId: z.string() })

const contextOutputSchema = z.object({
  trackId: z.string(),
  pipeline: z.any().nullable(),
  serviceHealth: z.record(z.string(), z.string()),
  error: z.string().optional()
})

const gapOutputSchema = z.object({
  trackId: z.string(),
  pipeline: z.any().nullable(),
  serviceHealth: z.record(z.string(), z.string()),
  lastSuccessfulEvent: z.string(),
  expectedNextEvent: z.string(),
  responsibleService: z.string(),
  terminalEvent: z.string().nullable(),
  error: z.string().optional()
})

const diagnosisOutputSchema = z.object({
  trackId: z.string(),
  currentStage: z.string(),
  status: z.string(),
  lastSuccessfulEvent: z.string(),
  expectedNextEvent: z.string(),
  responsibleService: z.string(),
  serviceStatus: z.string(),
  terminalEvent: z.string().nullable(),
  rootCause: z.string(),
  serviceHealth: z.record(z.string(), z.string())
})

const reportOutputSchema = z.object({
  trackId: z.string(),
  diagnosis: z.object({
    currentStage: z.string(),
    status: z.string(),
    summary: z.string(),
    suggestedAction: z.string()
  }),
  serviceHealth: z.record(z.string(), z.string())
})

const gatherContextStep = createStep({
  id: 'gather-context',
  inputSchema,
  outputSchema: contextOutputSchema,
  execute: async ({ inputData }) => {
    const backstageUrl = requireStringEnv('BACKSTAGE_URL')
    const { trackId } = inputData

    let pipeline: PipelineData | null = null
    try {
      const res = await axios.get(`${backstageUrl}/pipelines/${trackId}`, {
        timeout: 10_000
      })
      pipeline = res.data
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return {
          trackId,
          pipeline: null,
          serviceHealth: {} as ServiceHealthMap,
          error: `No pipeline found for track: ${trackId}`
        }
      }
      return {
        trackId,
        pipeline: null,
        serviceHealth: {} as ServiceHealthMap,
        error: `Backstage unreachable: ${err instanceof Error ? err.message : String(err)}`
      }
    }

    const serviceHealth: ServiceHealthMap = {}
    await Promise.all(
      Object.entries(SERVICE_HEALTH_URLS).map(async ([name, url]) => {
        try {
          const healthPath = '/health'
          await axios.get(`${url}${healthPath}`, { timeout: 5_000 })
          serviceHealth[name] = 'healthy'
        } catch {
          serviceHealth[name] = 'unreachable'
        }
      })
    )

    return { trackId, pipeline, serviceHealth }
  }
})

const identifyGapStep = createStep({
  id: 'identify-gap',
  inputSchema: contextOutputSchema,
  outputSchema: gapOutputSchema,
  execute: async ({ inputData }) => {
    const { trackId, pipeline, serviceHealth, error } = inputData

    if (!pipeline) {
      return {
        trackId,
        pipeline: null,
        serviceHealth,
        lastSuccessfulEvent: 'none',
        expectedNextEvent: TrackEvent.Uploaded,
        responsibleService: 'Soundgarden',
        terminalEvent: null,
        error
      }
    }

    const events = (pipeline as PipelineData).events ?? []
    const observedTypes = new Set(events.map((e: PipelineEvent) => e.eventType))

    const terminal = events.find((e: PipelineEvent) =>
      TERMINAL_EVENTS.includes(e.eventType)
    )

    let lastSuccessful: string = 'none'
    let expectedNext: string = TrackEvent.Uploaded

    for (let i = 0; i < EXPECTED_SEQUENCE.length; i++) {
      if (observedTypes.has(EXPECTED_SEQUENCE[i])) {
        lastSuccessful = EXPECTED_SEQUENCE[i]
        if (i + 1 < EXPECTED_SEQUENCE.length) {
          expectedNext = EXPECTED_SEQUENCE[i + 1]
        }
      }
    }

    return {
      trackId,
      pipeline,
      serviceHealth,
      lastSuccessfulEvent: lastSuccessful,
      expectedNextEvent: expectedNext,
      responsibleService: STAGE_OWNERS[expectedNext] ?? 'Unknown',
      terminalEvent: terminal?.eventType ?? null
    }
  }
})

const diagnoseStep = createStep({
  id: 'diagnose',
  inputSchema: gapOutputSchema,
  outputSchema: diagnosisOutputSchema,
  execute: async ({ inputData }) => {
    const {
      trackId,
      pipeline,
      serviceHealth,
      lastSuccessfulEvent,
      expectedNextEvent,
      responsibleService,
      terminalEvent,
      error
    } = inputData

    const pipelineData = pipeline as PipelineData | null
    const currentStage = pipelineData?.currentStage ?? 'unknown'
    const status = pipelineData?.status ?? 'unknown'

    const healthMap = serviceHealth as ServiceHealthMap
    const serviceKey = Object.keys(healthMap).find((k) =>
      responsibleService.includes(k)
    )
    const serviceStatus = serviceKey ? healthMap[serviceKey] : 'unknown'

    let rootCause: string

    if (error) {
      rootCause = error
    } else if (terminalEvent) {
      if (terminalEvent.includes('failed')) {
        rootCause = `Pipeline failed at stage: ${terminalEvent}`
      } else if (terminalEvent === TrackEvent.Rejected) {
        rootCause = 'Track was rejected by Stereo AI reasoning'
      } else if (terminalEvent === TrackEvent.DuplicateDetected) {
        rootCause = 'Track was identified as a duplicate by Petrified'
      } else {
        rootCause = `Terminal event: ${terminalEvent}`
      }
    } else if (
      serviceStatus === 'unreachable' ||
      serviceStatus === 'unhealthy'
    ) {
      rootCause = `${responsibleService} is ${serviceStatus} — it cannot process the expected "${expectedNextEvent}" event`
    } else if (status === 'processing') {
      const elapsed = pipelineData
        ? Date.now() - new Date(pipelineData.updatedAt).getTime()
        : 0
      rootCause = `Pipeline stalled at "${lastSuccessfulEvent}" for ${Math.round(elapsed / 1000)}s. ${responsibleService} is healthy but has not emitted "${expectedNextEvent}". Check consumer logs.`
    } else {
      rootCause = `Pipeline is in "${status}" state at stage "${currentStage}"`
    }

    return {
      trackId,
      currentStage,
      status,
      lastSuccessfulEvent,
      expectedNextEvent,
      responsibleService,
      serviceStatus,
      terminalEvent,
      rootCause,
      serviceHealth
    }
  }
})

const reportStep = createStep({
  id: 'report',
  inputSchema: diagnosisOutputSchema,
  outputSchema: reportOutputSchema,
  execute: async ({ inputData }) => {
    const {
      trackId,
      currentStage,
      status,
      expectedNextEvent,
      responsibleService,
      rootCause,
      serviceHealth,
      terminalEvent
    } = inputData

    const healthMap = serviceHealth as ServiceHealthMap

    let suggestedAction: string
    if (terminalEvent?.includes('failed')) {
      suggestedAction = `Check ${responsibleService} logs for the failure cause. Look for errors around the "${terminalEvent}" event.`
    } else if (terminalEvent === TrackEvent.Rejected) {
      suggestedAction =
        'Review the rejection reasoning in the Stereo logs. The track did not pass AI validation.'
    } else if (terminalEvent === TrackEvent.DuplicateDetected) {
      suggestedAction =
        'This track is a duplicate. Check the duplicate trackId in the event payload.'
    } else if (Object.values(healthMap).includes('unreachable')) {
      suggestedAction =
        'Run `pnpm infra` to start infrastructure, then retry the pipeline.'
    } else {
      suggestedAction = `Investigate ${responsibleService} consumer logs for "${expectedNextEvent}" processing.`
    }

    const summary = `Track ${trackId}: ${rootCause}`

    const diagnosis = {
      currentStage,
      status,
      summary,
      suggestedAction
    }

    signalBus.emit('DIAGNOSIS_READY', {
      trackId,
      diagnosis,
      timestamp: new Date().toISOString()
    })

    return { trackId, diagnosis, serviceHealth }
  }
})

export const debugPipelineWorkflow = createWorkflow({
  id: 'debug-pipeline',
  description:
    'Diagnose why a track is stuck or failed in the processing pipeline',
  inputSchema,
  outputSchema: reportOutputSchema
})
  .then(gatherContextStep)
  .then(identifyGapStep)
  .then(diagnoseStep)
  .then(reportStep)
  .commit()
