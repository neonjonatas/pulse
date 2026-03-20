import { CircuitBreaker } from '@pack/patterns'

export const spotifyCircuit = new CircuitBreaker({
  failureThreshold: 3,
  timeoutMs: 10_000,
  resetTimeoutMs: 30_000,
  onStateChange: ({ previous, next }) => {
    console.log(`[chester:circuit] Spotify circuit: ${previous} → ${next}`)
  },
  onFailure: (error) => {
    console.error('[chester:circuit] Spotify call failed:', error)
  },
  onSuccess: () => {
    console.log('[chester:circuit] Spotify call succeeded')
  }
})
