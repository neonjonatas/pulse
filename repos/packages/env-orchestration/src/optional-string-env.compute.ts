/**
 * Reads an optional string environment variable, returning a default
 * when the variable is not set.
 */
export function optionalStringEnv(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue
}
