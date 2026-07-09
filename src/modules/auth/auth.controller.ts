import { Request, Response } from 'express';
import { authService } from './auth.service';
import { asyncHandler } from '../../shared/utils';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.status(200).json({ success: true, data: result });
  });
}

export const authController = new AuthController();
