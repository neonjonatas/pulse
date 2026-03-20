export type StereoDecision = 'approved' | 'rejected'

export interface StereoContext {
  trackId: string
  fingerprintHash: string
  audioHash: string
  transcriptionText: string
  transcriptionLanguage: string
  transcriptionDuration: number
}

export interface StereoResult {
  decision: StereoDecision
  reason: string
}

/// Port for AI-based copyright and content policy reasoning.
export abstract class StereoPort {
  abstract reason(context: StereoContext): Promise<StereoResult>
}
