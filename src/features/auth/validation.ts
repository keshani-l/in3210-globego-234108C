import { z } from 'zod';

const required = (label: string) => z.string().trim().min(1, `Enter your ${label}.`);

export const loginSchema = z.object({
  username: required('username'),
  password: z.string().refine((value) => value.trim().length > 0, 'Enter your password.'),
});

export const registrationSchema = z.object({
  firstName: required('first name'),
  lastName: required('last name'),
  email: required('email address').pipe(z.email('Enter a valid email address.')),
  password: z.string().refine((value) => value.trim().length > 0, 'Enter your password.')
    .refine((value) => value.length >= 8, 'Use at least 8 characters for your password.'),
  confirmPassword: z.string().min(1, 'Confirm your password.'),
}).refine(({ password, confirmPassword }) => !confirmPassword || password === confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match.',
});

export type LoginFields = z.input<typeof loginSchema>;
export type RegistrationFields = z.input<typeof registrationSchema>;
