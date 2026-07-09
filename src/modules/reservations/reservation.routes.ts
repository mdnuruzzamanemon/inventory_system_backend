import { Router } from 'express';
import { reservationController } from './reservation.controller';
import { validate, authenticate } from '../../middleware';
import { createReservationSchema } from './reservation.validation';

const router = Router();

router.use(authenticate);

router.post('/', validate(createReservationSchema), reservationController.reserve);
router.get('/me', reservationController.myReservations);

export default router;
