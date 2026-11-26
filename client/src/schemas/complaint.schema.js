import { z } from 'zod';

/**
 * Zod validation schema for student campus issue submission
 * Demonstrates Unit IV: Client-side validation & dynamic error feedback
 */
export const complaintSubmissionSchema = z.object({
  title: z
    .string()
    .min(1, 'Issue title is required')
    .min(3, 'Title must be at least 3 characters (e.g. Broken AC)')
    .max(120, 'Title cannot exceed 120 characters'),
  category: z
    .string()
    .min(1, 'Please select an issue category'),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: 'Please select a valid priority level' }),
  }),
  building: z
    .string()
    .min(1, 'Campus building is required'),
  floor: z
    .string()
    .optional()
    .default('Ground Floor'),
  room: z
    .string()
    .min(1, 'Room or Lab number is required (e.g. Room 304)'),
  landmark: z
    .string()
    .optional(),
  description: z
    .string()
    .min(1, 'Detailed description is required')
    .min(10, 'Please provide at least 10 characters describing the issue and breakdown'),
});
