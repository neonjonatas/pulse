import { requireStringEnv } from './require-string-env'

export function requireNumberEnv(name: string): number {
  const value = requireStringEnv(name)
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    throw new Error(`Environment variable ${name} must be a valid number`)
  }

  return parsed
}
