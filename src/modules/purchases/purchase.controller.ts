import { Response } from 'express';
import { purchaseService } from './purchase.service';
import { asyncHandler } from '../../shared/utils';
import { AuthenticatedRequest } from '../../shared/interfaces';

export class PurchaseController {
  create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await purchaseService.purchase(req.user!.userId, req.body.reservationId);
    res.status(201).json({ success: true, data: result });
  });
}

export const purchaseController = new PurchaseController();
