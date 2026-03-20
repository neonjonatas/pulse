import { ReasoningLabel } from './reasoning.enum'

export function getThinkingLabel(
  isConnected: boolean,
  isStreaming: boolean,
  duration?: number
): string {
  if (!isConnected || isStreaming) return ReasoningLabel.CallingBackstage

  return ReasoningLabel.PipelineCompleted.replace(
    '{duration}',
    String(duration ?? 0)
  )
}
