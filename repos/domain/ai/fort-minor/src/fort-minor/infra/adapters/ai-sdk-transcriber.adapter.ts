import { Injectable } from '@nestjs/common'
import { experimental_transcribe as transcribe } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import * as fs from 'node:fs'

import { CircuitBreaker } from '@pack/patterns'

import { optionalStringEnv } from '@pack/env-orchestration'
import {
  TranscriberPort,
  type TranscriptionOutput
} from '@application/ports/transcriber.port'

const TRANSCRIPTION_TIMEOUT_MS = 60_000

/**
 * Transcribes audio using the Vercel AI SDK with OpenAI Whisper.
 * Wraps the AI call in a circuit breaker to protect against provider outages.
 */
@Injectable()
export class AiSdkTranscriberAdapter extends TranscriberPort {
  private readonly circuitBreaker = new CircuitBreaker({
    failureThreshold: 3,
    timeoutMs: TRANSCRIPTION_TIMEOUT_MS,
    resetTimeoutMs: 60_000
  })

  async transcribe(filePath: string): Promise<TranscriptionOutput> {
    const model = optionalStringEnv('AI_MODEL', 'whisper-1')
    const apiKey = optionalStringEnv('OPENAI_API_KEY', '')

    const openai = createOpenAI({ apiKey })
    const buffer = await fs.promises.readFile(filePath)

    const result = await this.circuitBreaker.execute(async () => {
      return transcribe({
        model: openai.transcription(model),
        audio: buffer
      })
    })

    return {
      language: result.language ?? 'unknown',
      text: result.text ?? '',
      segments: (result.segments ?? []).map((s) => ({
        start: s.startSecond ?? 0,
        end: s.endSecond ?? 0,
        text: s.text ?? ''
      })),
      durationInSeconds: result.durationInSeconds ?? 0
    }
  }
}
