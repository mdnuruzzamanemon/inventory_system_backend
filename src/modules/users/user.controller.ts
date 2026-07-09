import { Response } from 'express';
import { asyncHandler } from '../../shared/utils';
import { AuthenticatedRequest } from '../../shared/interfaces';

export class UserController {
  getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        id: req.user!.userId,
        username: req.user!.username,
        email: req.user!.email,
      },
    });
  });
}

export const userController = new UserController();
