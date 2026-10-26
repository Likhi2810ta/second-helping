import { z } from 'zod'

export const listingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(80, 'Title must be 80 characters or fewer'),
  description: z.string().trim().max(500, 'Description must be 500 characters or fewer').optional(),
  category: z.enum(['cooked', 'bakery', 'fruits_veg', 'packed', 'other']),
  diet: z.enum(['veg', 'non_veg', 'both']),
  portions: z
    .number({ message: 'Enter the number of portions' })
    .int('Portions must be a whole number')
    .min(1, 'At least 1 portion')
    .max(1000, 'At most 1000 portions'),
  hoursValid: z.number().min(0.5).max(24),
  address: z.string().trim().min(5, 'Please enter the pickup address'),
  pickup_note: z.string().trim().max(200, 'Note must be 200 characters or fewer').optional(),
  safetyChecked: z.boolean().refine((v) => v === true, {
    message: 'Please confirm the food safety statement',
  }),
})

export type ListingInput = z.infer<typeof listingSchema>