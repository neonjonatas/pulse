/**
 * Reads an optional numeric environment variable, returning a default
 * when the variable is not set. Throws if the value is present but
 * not a valid finite number.
 */
export function optionalNumberEnv(name: string, defaultValue: number): number {
  const value = process.env[name]
  if (!value) return defaultValue
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    throw new Error(`Environment variable ${name} must be a valid number`)
  }
  return parsed
}
