'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useImmer } from 'use-immer'

import { createReasoningStream } from './reasoning.connection'
import type { PipelineEventPayload, ReasoningMessage } from './reasoning.types'

const IDLE_TIMEOUT_MS = getIdleTimeoutFromEnv()

export interface UseReasoningStreamResult {
  messages: ReasoningMessage[]
  content: string
  isConnected: boolean
  isStreaming: boolean
  error: Error | null
}

export function useReasoningStream(
  trackId: string | null
): UseReasoningStreamResult {
  const [messages, updateMessages] = useImmer<ReasoningMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const seenIdsRef = useRef(new Set<string>())

  const scheduleStreamingEnd = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
    }
    idleTimerRef.current = setTimeout(() => {
      setIsStreaming(false)
    }, IDLE_TIMEOUT_MS)
  }, [])

  useEffect(() => {
    if (!trackId) return

    const eventSource = createReasoningStream(trackId)

    function onOpen() {
      setIsConnected(true)
      setError(null)
    }

    function onError() {
      setIsConnected(false)
      setIsStreaming(false)
      if (eventSource.readyState === EventSource.CLOSED) {
        setError(new Error('SSE connection closed'))
      }
    }

    function onPipelineEvent(e: MessageEvent) {
      const eventId = e.lastEventId
      if (eventId && seenIdsRef.current.has(eventId)) return
      if (eventId) seenIdsRef.current.add(eventId)

      try {
        const event: PipelineEventPayload = JSON.parse(e.data)

        const message =
          typeof event.payload.message === 'string' &&
          event.payload.message.length > 0
            ? event.payload.message
            : `Pipeline: ${event.event}`

        setIsStreaming(true)
        updateMessages((draft) => {
          draft.push({
            id: event.id,
            event: event.event,
            message,
            timestamp: event.timestamp,
            trackId: event.trackId
          })
        })
        scheduleStreamingEnd()
      } catch {
        /* malformed event — skip */
      }
    }

    function onCompleted() {
      setIsStreaming(false)
      eventSource.close()
      setIsConnected(false)
    }

    eventSource.addEventListener('open', onOpen)
    eventSource.addEventListener('error', onError)
    eventSource.addEventListener('pipeline.event', onPipelineEvent)
    eventSource.addEventListener('pipeline.completed', onCompleted)

    if (eventSource.readyState === EventSource.OPEN) {
      setIsConnected(true)
    }

    return () => {
      eventSource.removeEventListener('open', onOpen)
      eventSource.removeEventListener('error', onError)
      eventSource.removeEventListener('pipeline.event', onPipelineEvent)
      eventSource.removeEventListener('pipeline.completed', onCompleted)
      eventSource.close()
      setIsConnected(false)

      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }
    }
  }, [trackId, scheduleStreamingEnd, updateMessages])

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }
    }
  }, [])

  const content = messages
    .map((message) => message.message)
    .filter(Boolean)
    .join('\n\n')

  return { messages, content, isConnected, isStreaming, error }
}

function getIdleTimeoutFromEnv(): number {
  const value = process.env.NEXT_PUBLIC_REASONING_IDLE_TIMEOUT_MS

  if (!value) {
    throw new Error(
      'Missing required env var NEXT_PUBLIC_REASONING_IDLE_TIMEOUT_MS'
    )
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(
      'NEXT_PUBLIC_REASONING_IDLE_TIMEOUT_MS must be a positive number'
    )
  }

  return parsed
}
