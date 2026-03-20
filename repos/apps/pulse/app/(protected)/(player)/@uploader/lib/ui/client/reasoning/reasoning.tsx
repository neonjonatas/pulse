'use client'

import type { ReactNode } from 'react'

import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger
} from '@shadcn/components/ai-elements/reasoning'
import { Shimmer } from '@shadcn/components/ai-elements/shimmer'
import { ScrollArea } from '@infra/shadcn/components/ui/scroll-area'

import { getThinkingLabel } from './get-thinking-label.compute'
import { useReasoningStream } from './reasoning.hooks'

export interface ReasoningPipelineProps {
  trackId?: string | null
}

export function ReasoningPipeline({ trackId = null }: ReasoningPipelineProps) {
  const { content, isConnected, isStreaming, error } =
    useReasoningStream(trackId)

  function getThinkingMessage(
    streaming: boolean,
    duration?: number
  ): ReactNode {
    const label = getThinkingLabel(isConnected, streaming, duration)
    return <Shimmer duration={1}>{label}</Shimmer>
  }

  return (
    <ScrollArea className="h-full w-full rounded-sm px-2 pb-2">
      <Reasoning className="w-full" isStreaming={isStreaming}>
        <ReasoningTrigger getThinkingMessage={getThinkingMessage} />
        <ReasoningContent>
          {error ? `Connection error: ${error.message}` : content || ''}
        </ReasoningContent>
      </Reasoning>
    </ScrollArea>
  )
}
