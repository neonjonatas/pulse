import { Injectable, PipeTransform } from '@nestjs/common'
import { z } from 'zod'

import type { GoogleAuthorityRequestDto } from '@interface/dto'
import { parseWithSchema } from '@interface/http/pipes/zod-validation.util'

const googleAuthoritySchema = z
  .object({
    idToken: z.string().min(1, 'Google ID token is required')
  })
  .strict()

@Injectable()
export class GoogleAuthorityBodyPipe
  implements PipeTransform<unknown, GoogleAuthorityRequestDto>
{
  transform(value: unknown): GoogleAuthorityRequestDto {
    return parseWithSchema(googleAuthoritySchema, value)
  }
}
