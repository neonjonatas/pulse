import { Mastra } from '@mastra/core'
import { Agent } from '@mastra/core/agent'

import { requireStringEnv } from '@pack/env-orchestration'
import { signalBus } from '../shinoda/signals/signal-bus'
import { instructions } from '../shinoda/knowledge/instructions'
import {
  analysePipelineTool,
  inspectEventsTool,
  checkServicesTool
} from '../shinoda/tools'
import { debugPipelineWorkflow, healthPipelineWorkflow } from '@workflows'
import { createMcpClient, ObservabilitySink } from '@infra/mcp'

signalBus.on('TRACK_STUCK', (payload) => {
  console.log(
    `[shinoda:signal] TRACK_STUCK — track=${payload.trackId} stage=${payload.lastStage} stuck=${payload.stuckSinceMs}ms`
  )
})

signalBus.on('SERVICE_UNHEALTHY', (payload) => {
  console.log(
    `[shinoda:signal] SERVICE_UNHEALTHY — service=${payload.service} url=${payload.url} error=${payload.error}`
  )
})

signalBus.on('PIPELINE_ANOMALY', (payload) => {
  console.log(
    `[shinoda:signal] PIPELINE_ANOMALY — track=${payload.trackId} type=${payload.anomalyType} ${payload.description}`
  )
})

signalBus.on('DIAGNOSIS_READY', (payload) => {
  console.log(
    `[shinoda:signal] DIAGNOSIS_READY — track=${payload.trackId} status=${payload.diagnosis.status} ${payload.diagnosis.summary}`
  )
})

const mcpClient = createMcpClient()
if (mcpClient) {
  ObservabilitySink.wire(signalBus, mcpClient)
  console.log('[shinoda] MCP observability sink active')
}

const shinodaAgent = new Agent({
  id: 'shinoda',
  name: 'shinoda',
  model: requireStringEnv('SHINODA_MODEL'),
  instructions,
  tools: {
    analysePipelineTool,
    inspectEventsTool,
    checkServicesTool
  }
})

export { debugPipelineWorkflow, healthPipelineWorkflow }

export const mastra = new Mastra({
  agents: { shinoda: shinodaAgent }
})
