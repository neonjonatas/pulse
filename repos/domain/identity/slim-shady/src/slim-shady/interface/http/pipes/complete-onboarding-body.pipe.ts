import { Injectable, PipeTransform } from '@nestjs/common'
import { z } from 'zod'

import type { CompleteOnboardingRequestDto } from '@interface/dto'
import { parseWithSchema } from '@interface/http/pipes/zod-validation.util'

const completeOnboardingSchema = z
  .object({
    completed: z.boolean()
  })
  .strict()

@Injectable()
export class CompleteOnboardingBodyPipe
  implements PipeTransform<unknown, CompleteOnboardingRequestDto>
{
  transform(value: unknown): CompleteOnboardingRequestDto {
    return parseWithSchema(completeOnboardingSchema, value)
  }
}
