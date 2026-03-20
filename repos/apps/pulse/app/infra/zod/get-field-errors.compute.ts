import type { FieldErrors, ZodObjectSchema } from './validation.types'

export function getFieldErrors<Schema extends ZodObjectSchema>(
  input: unknown,
  schema: Schema
): FieldErrors<Schema> | null {
  const parseResult = schema.safeParse(input)

  if (parseResult.success) return null

  return parseResult.error.flatten().fieldErrors
}
