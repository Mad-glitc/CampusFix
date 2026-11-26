import { z } from 'zod';

/**
 * Client-Side Authentication Schemas using Zod
 * Demonstrates Unit IV: Zod schema validation & dynamic validation error models
 */

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Institutional email is required')
    .email('Please enter a valid email address (e.g. user@campus.edu)'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(60, 'Name cannot exceed 60 characters'),
    email: z
      .string()
      .min(1, 'Institutional email is required')
      .email('Please enter a valid campus email address'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password is too long'),
    role: z.enum(['student', 'staff', 'admin'], {
      errorMap: () => ({ message: 'Please select a valid role' }),
    }),
    department: z
      .string()
      .min(1, 'Department is required'),
    phoneNumber: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[0-9]{10}$/.test(val.replace(/\D/g, '')),
        'Phone number must be a 10-digit number'
      ),
    accessCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const code = (data.accessCode || '').trim();
    if (data.role === 'student') {
      if (!code) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['accessCode'],
          message: 'Student registration number is required (e.g. 2026-CS-1042)',
        });
      } else if (code.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['accessCode'],
          message: 'Registration number must be at least 3 characters',
        });
      }
    } else if (data.role === 'staff') {
      if (!code) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['accessCode'],
          message: 'Technical staff security access key is required',
        });
      }
    } else if (data.role === 'admin') {
      if (!code) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['accessCode'],
          message: 'Administrator master access key is required',
        });
      }
    }
  });
