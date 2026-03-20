export function requireStringEnv(flag: string): string {
  const value = process.env[flag]
  if (!value) {
    throw new Error(`Missing required env: ${flag}`)
  }
  return value
}
