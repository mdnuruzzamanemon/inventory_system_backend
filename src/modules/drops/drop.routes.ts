import { Router } from 'express';
import { dropController } from './drop.controller';
import { validate } from '../../middleware';
import { createDropSchema } from './drop.validation';

const router = Router();

router.post('/', validate(createDropSchema), dropController.create);
router.get('/active', dropController.getActive);
router.get('/upcoming', dropController.getUpcoming);

export default router;
