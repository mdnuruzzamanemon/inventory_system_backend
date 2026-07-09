import { z } from 'zod';

export const createPurchaseSchema = z.object({
  body: z.object({
    reservationId: z.string().uuid(),
  }),
});
