import { BadRequestException } from '@nestjs/common'
import type { ZodSchema } from 'zod'

export function parseWithSchema<Output>(
  schema: ZodSchema<Output>,
  value: unknown
): Output {
  const parsed = schema.safeParse(value)

  if (!parsed.success) {
    const flattened = parsed.error.flatten()
    throw new BadRequestException({
      message: 'Invalid request body',
      errors: {
        fieldErrors: flattened.fieldErrors,
        formErrors: flattened.formErrors
      }
    })
  }

  return parsed.data
}
