import { Injectable, PipeTransform } from '@nestjs/common'
import { z } from 'zod'

import type { UpdateProfileRequestDto } from '@interface/dto'
import { parseWithSchema } from '@interface/http/pipes/zod-validation.util'

const updateProfileSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be at most 30 characters')
      .regex(
        /^[a-z0-9_]+$/,
        'Username can only contain lowercase letters, numbers, and underscores'
      )
      .optional()
      .nullable(),
    displayName: z
      .string()
      .trim()
      .min(1, 'Display name is required')
      .max(50, 'Display name must be at most 50 characters')
      .optional(),
    avatarUrl: z
      .string()
      .trim()
      .url('Avatar URL must be a valid URL')
      .optional()
      .nullable(),
    bio: z
      .string()
      .trim()
      .max(300, 'Bio must be at most 300 characters')
      .optional()
      .nullable(),
    country: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{2}$/, 'Country must be ISO alpha-2 format')
      .optional()
      .nullable()
  })
  .strict()

@Injectable()
export class UpdateProfileBodyPipe
  implements PipeTransform<unknown, UpdateProfileRequestDto>
{
  transform(value: unknown): UpdateProfileRequestDto {
    return parseWithSchema(updateProfileSchema, value)
  }
}
