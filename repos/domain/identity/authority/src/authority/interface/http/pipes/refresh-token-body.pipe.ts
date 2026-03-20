import { Injectable, PipeTransform } from '@nestjs/common'
import { z } from 'zod'

import type { RefreshTokenRequestDto } from '@interface/dto'
import { parseWithSchema } from '@interface/http/pipes/zod-validation.util'

const refreshTokenSchema = z
  .object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  })
  .strict()

@Injectable()
export class RefreshTokenBodyPipe
  implements PipeTransform<unknown, RefreshTokenRequestDto>
{
  transform(value: unknown): RefreshTokenRequestDto {
    return parseWithSchema(refreshTokenSchema, value)
  }
}
