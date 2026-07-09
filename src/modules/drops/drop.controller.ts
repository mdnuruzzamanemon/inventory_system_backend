import { Request, Response } from 'express';
import { dropService } from './drop.service';
import { asyncHandler } from '../../shared/utils';

export class DropController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const result = await dropService.create(req.body);
    res.status(201).json({ success: true, data: result });
  });

  getActive = asyncHandler(async (_req: Request, res: Response) => {
    const drops = await dropService.getActiveDrops();
    res.status(200).json({ success: true, data: drops });
  });
}

export const dropController = new DropController();
