import { z } from 'zod';

export const createReservationSchema = z.object({
  body: z.object({
    productId: z.string().uuid(),
  }),
});
