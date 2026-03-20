import { CircuitBreaker } from '@pack/patterns'

export const mcpPulseCircuit = new CircuitBreaker({
  failureThreshold: 3,
  timeoutMs: 15_000,
  resetTimeoutMs: 30_000,
  onStateChange: ({ previous, next }) => {
    console.log(`[emily:circuit] Pulse MCP circuit: ${previous} → ${next}`)
  },
  onFailure: (error) => {
    console.error('[emily:circuit] Pulse MCP call failed:', error)
  }
})

export const mcpShinodaCircuit = new CircuitBreaker({
  failureThreshold: 3,
  timeoutMs: 15_000,
  resetTimeoutMs: 30_000,
  onStateChange: ({ previous, next }) => {
    console.log(`[emily:circuit] Shinoda MCP circuit: ${previous} → ${next}`)
  },
  onFailure: (error) => {
    console.error('[emily:circuit] Shinoda MCP call failed:', error)
  }
})

export const transformCircuit = new CircuitBreaker({
  failureThreshold: 5,
  timeoutMs: 5_000,
  resetTimeoutMs: 15_000,
  onStateChange: ({ previous, next }) => {
    console.log(`[emily:circuit] Transform circuit: ${previous} → ${next}`)
  },
  onFailure: (error) => {
    console.error('[emily:circuit] Transformation failed:', error)
  }
})
