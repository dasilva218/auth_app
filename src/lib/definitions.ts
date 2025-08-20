import * as z from 'zod'

export const SignupFormSchema = z.object(
  {
    name: z.string().trim(),
    email: z.email(),
    password: z.string().min(6).max(100),
  }
)

