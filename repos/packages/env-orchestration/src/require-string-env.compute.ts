/**
 * Reads a required string environment variable.
 * Throws immediately at startup if the variable is missing or empty,
 * enforcing the fail-fast convention from GENERAL_CODE_GUIDELINE.
 */
export function requireStringEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}
