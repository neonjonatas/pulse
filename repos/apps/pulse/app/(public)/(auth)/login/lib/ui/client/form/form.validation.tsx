import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .email('Email must be a valid email address.')
    .trim()
    .min(1, 'Email is required.'),

  password: z
    .string()
    .trim()
    .min(1, 'Password is required.')
    .min(8, 'Password must be at least 8 characters.')
})

export type LoginFormSchema = typeof loginSchema
