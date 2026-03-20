import { Injectable, PipeTransform } from '@nestjs/common'
import { z } from 'zod'

import type { SignupRequestDto } from '@interface/dto'
import { parseWithSchema } from '@interface/http/pipes/zod-validation.util'

const signupSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Email must be valid'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters'),
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .optional()
      .nullable()
  })
  .strict()

@Injectable()
export class SignupBodyPipe
  implements PipeTransform<unknown, SignupRequestDto>
{
  transform(value: unknown): SignupRequestDto {
    return parseWithSchema(signupSchema, value)
  }
}
