import { z } from 'zod'

import type { HttpError } from '@api/transport/http'

export type ZodObjectSchema = z.ZodObject<z.ZodRawShape>

export type FieldErrors<Schema extends ZodObjectSchema> = z.ZodFlattenedError<
  z.output<Schema>
>['fieldErrors']

export interface SchemaState<Schema extends ZodObjectSchema> {
  apiError: HttpError | null
  fieldErrors: FieldErrors<Schema>
  isPending: boolean
}
