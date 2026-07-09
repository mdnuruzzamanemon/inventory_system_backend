import { z } from 'zod';

export const createDropSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional().default(''),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional().nullable(),
    products: z.array(
      z.object({
        name: z.string().min(1).max(255),
        price: z.number().positive(),
        stock: z.number().int().positive(),
      }),
    ).min(1),
  }),
});

export type CreateDropInput = z.infer<typeof createDropSchema>['body'];
