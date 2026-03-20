'use client'

import { useAtomValue } from 'jotai'

import { isReasoningAtom } from '@atoms'
import { ReasoningPipeline, Uploader } from '@uploader/ui'

export function PageContainer() {
  const isReasoning = useAtomValue(isReasoningAtom)

  return isReasoning ? <ReasoningPipeline /> : <Uploader />
}
