export interface TranscriptSegment {
  start: number
  end: number
  text: string
}

export interface TranscriptionOutput {
  language: string
  text: string
  segments: TranscriptSegment[]
  durationInSeconds: number
}

export abstract class TranscriberPort {
  abstract transcribe(filePath: string): Promise<TranscriptionOutput>
}
