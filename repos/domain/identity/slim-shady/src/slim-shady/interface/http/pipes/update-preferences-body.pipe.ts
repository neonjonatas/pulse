import { Injectable, PipeTransform } from '@nestjs/common'
import { z } from 'zod'

import type { UpdatePreferencesRequestDto } from '@interface/dto'
import { parseWithSchema } from '@interface/http/pipes/zod-validation.util'

const updatePreferencesSchema = z
  .object({
    theme: z.enum(['dark', 'light', 'system']).optional(),
    explicitContentFilter: z.boolean().optional(),
    audioQuality: z.enum(['low', 'normal', 'high', 'very_high']).optional(),
    privateSession: z.boolean().optional()
  })
  .strict()

@Injectable()
export class UpdatePreferencesBodyPipe
  implements PipeTransform<unknown, UpdatePreferencesRequestDto>
{
  transform(value: unknown): UpdatePreferencesRequestDto {
    return parseWithSchema(updatePreferencesSchema, value)
  }
}
