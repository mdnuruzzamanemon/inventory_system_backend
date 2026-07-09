import { Response } from 'express';
import { reservationService } from './reservation.service';
import { asyncHandler } from '../../shared/utils';
import { AuthenticatedRequest } from '../../shared/interfaces';

export class ReservationController {
  reserve = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await reservationService.reserve(req.user!.userId, req.body.productId);
    res.status(201).json({ success: true, data: result });
  });

  myReservations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const reservations = await reservationService.getUserActiveReservations(req.user!.userId);
    res.status(200).json({ success: true, data: reservations });
  });
}

export const reservationController = new ReservationController();
