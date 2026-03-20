import { requireStringEnv } from './require-string-env.compute'

/**
 * Reads a required numeric environment variable.
 * Delegates to requireStringEnv for presence check, then validates
 * the value parses to a finite number.
 */
export function requireNumberEnv(name: string): number {
  const value = requireStringEnv(name)
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    throw new Error(`Environment variable ${name} must be a valid number`)
  }
  return parsed
}
