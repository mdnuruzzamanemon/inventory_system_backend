import { Router } from 'express';
import { purchaseController } from './purchase.controller';
import { validate, authenticate } from '../../middleware';
import { createPurchaseSchema } from './purchase.validation';

const router = Router();

router.use(authenticate);
router.post('/', validate(createPurchaseSchema), purchaseController.create);

export default router;
