export function optionalStringEnv(flag: string, defaultValue: string): string {
  const value = process.env[flag]
  return value ?? defaultValue
}
