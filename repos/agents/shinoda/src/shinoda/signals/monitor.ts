import { io, type Socket } from 'socket.io-client'
import axios from 'axios'

import { requireStringEnv, requireNumberEnv } from '@pack/env-orchestration'
import { evaluateAllRules, stuckTrackRule } from './anomaly-rules'

interface MonitorConfig {
  backstageUrl: string
  pollIntervalMs: number
  stuckThresholdMs: number
}

export class ShinodaMonitor {
  private socket: Socket | null = null
  private pollTimer: ReturnType<typeof setInterval> | null = null
  private config: MonitorConfig
  private running = false

  constructor(config?: Partial<MonitorConfig>) {
    this.config = {
      backstageUrl: config?.backstageUrl ?? requireStringEnv('BACKSTAGE_URL'),
      pollIntervalMs:
        config?.pollIntervalMs ?? requireNumberEnv('MONITOR_POLL_INTERVAL_MS'),
      stuckThresholdMs:
        config?.stuckThresholdMs ?? requireNumberEnv('STUCK_THRESHOLD_MS')
    }
  }

  start(): void {
    if (this.running) return
    this.running = true

    this.connectSocket()
    this.startPolling()

    console.log(
      `[shinoda:monitor] started — socket.io: ${this.config.backstageUrl}/pipeline, poll: ${this.config.pollIntervalMs}ms`
    )
  }

  stop(): void {
    if (!this.running) return
    this.running = false

    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }

    if (this.pollTimer) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }

    console.log('[shinoda:monitor] stopped')
  }

  private connectSocket(): void {
    this.socket = io(`${this.config.backstageUrl}/pipeline`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 5_000,
      reconnectionAttempts: Infinity
    })

    this.socket.on('connect', () => {
      console.log('[shinoda:monitor] socket.io connected to backstage')
    })

    this.socket.on('disconnect', (reason) => {
      console.log(`[shinoda:monitor] socket.io disconnected: ${reason}`)
    })

    this.socket.on('connect_error', (error) => {
      console.log(
        `[shinoda:monitor] socket.io connection error: ${error.message}`
      )
    })

    this.socket.on('pipeline.event', (payload: PipelineEventPayload) => {
      this.handlePipelineEvent(payload)
    })
  }

  private handlePipelineEvent(payload: PipelineEventPayload): void {
    console.log(
      `[shinoda:monitor] event received — ${payload.event} for track ${payload.trackId}`
    )

    this.fetchAndEvaluate(payload.trackId).catch((err) => {
      console.error(
        `[shinoda:monitor] failed to evaluate track ${payload.trackId}:`,
        err
      )
    })
  }

  private startPolling(): void {
    this.pollTimer = setInterval(() => {
      this.pollActivePipelines().catch((err) => {
        console.error('[shinoda:monitor] poll error:', err)
      })
    }, this.config.pollIntervalMs)
  }

  private async pollActivePipelines(): Promise<void> {
    try {
      const response = await axios.get(
        `${this.config.backstageUrl}/pipelines/active`,
        { timeout: 10_000 }
      )

      const pipelines = response.data as PipelineState[]
      for (const pipeline of pipelines) {
        stuckTrackRule(pipeline, this.config.stuckThresholdMs)
      }
    } catch {
      console.log('[shinoda:monitor] backstage unreachable during poll cycle')
    }
  }

  private async fetchAndEvaluate(trackId: string): Promise<void> {
    try {
      const response = await axios.get(
        `${this.config.backstageUrl}/pipelines/${trackId}`,
        { timeout: 10_000 }
      )
      evaluateAllRules(response.data, this.config.stuckThresholdMs)
    } catch {
      console.log(
        `[shinoda:monitor] could not fetch pipeline for track ${trackId}`
      )
    }
  }
}

interface PipelineEventPayload {
  type: string
  event: string
  trackId: string
  timestamp: string
  payload: Record<string, unknown>
}

interface PipelineState {
  trackId: string
  status: 'processing' | 'ready' | 'failed'
  currentStage: string
  events: Array<{ eventType: string; timestamp: string }>
  updatedAt: string
}
