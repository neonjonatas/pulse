import { Injectable, PipeTransform } from '@nestjs/common'
import { z } from 'zod'

import type { LoginRequestDto } from '@interface/dto'
import { parseWithSchema } from '@interface/http/pipes/zod-validation.util'

const loginSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Email must be valid'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
  })
  .strict()

@Injectable()
export class LoginBodyPipe implements PipeTransform<unknown, LoginRequestDto> {
  transform(value: unknown): LoginRequestDto {
    return parseWithSchema(loginSchema, value)
  }
}
