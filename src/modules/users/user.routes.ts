import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../../middleware';

const router = Router();

router.get('/me', authenticate, userController.getProfile);

export default router;
