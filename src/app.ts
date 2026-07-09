import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import dropRoutes from './modules/drops/drop.routes';
import reservationRoutes from './modules/reservations/reservation.routes';
import purchaseRoutes from './modules/purchases/purchase.routes';
import { setupAssociations } from './config/associations';

const app = express();

setupAssociations();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/drops', dropRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/purchases', purchaseRoutes);

app.use(errorHandler);

export default app;
