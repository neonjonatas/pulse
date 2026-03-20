import { z } from 'zod'

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .max(80, 'Name must be at most 80 characters')
    .optional(),
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

export type SignupFormSchema = typeof signupSchema
