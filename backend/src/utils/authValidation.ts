import { z } from 'zod';

const emailSchema = z
  .string({ required_error: 'Email is required.' })
  .trim()
  .min(1, 'Email is required.')
  .email('Please enter a valid email address.');

const passwordLoginSchema = z
  .string({ required_error: 'Password is required.' })
  .min(1, 'Password is required.');

const passwordRegisterSchema = z
  .string({ required_error: 'Password is required.' })
  .min(8, 'Password must be at least 8 characters.')
  .max(128, 'Password must not exceed 128 characters.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.');

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required.' })
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(50, 'Name must not exceed 50 characters.')
    .regex(/^[a-zA-Z\s\-'.]+$/, 'Name contains invalid characters.'),
  email: emailSchema,
  password: passwordRegisterSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordLoginSchema,
});

/** Extract the first Zod error message per field */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as string;
    if (field && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }
  return fieldErrors;
}
