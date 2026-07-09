import { Op } from 'sequelize';
import sequelize from '../../config/database';
import { AppError } from '../../shared/errors';
import { logger } from '../../shared/utils';
import { Product } from '../products/product.model';
import { Reservation, ReservationStatus } from '../reservations/reservation.model';
import { Purchase } from './purchase.model';
import { User } from '../users/user.model';
import { getIO } from '../../socket/handlers';

export class PurchaseService {
  async purchase(userId: string, reservationId: string) {
    const result = await sequelize.transaction(async (transaction) => {
      // Lock the reservation row
      const reservation = await Reservation.findByPk(reservationId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!reservation) {
        throw new AppError('Reservation not found', 404);
      }

      if (reservation.userId !== userId) {
        throw new AppError('This reservation does not belong to you', 403);
      }

      if (reservation.status !== ReservationStatus.ACTIVE) {
        throw new AppError('Reservation is no longer active', 409);
      }

      if (new Date() > reservation.expiresAt) {
        reservation.status = ReservationStatus.EXPIRED;
        await reservation.save({ transaction });

        const expiredProduct = await Product.findByPk(reservation.productId, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (expiredProduct) {
          expiredProduct.availableStock += 1;
          await expiredProduct.save({ transaction });
        }

        throw new AppError('Reservation has expired. Please reserve again.', 409);
      }

      // Lock the product row
      const product = await Product.findByPk(reservation.productId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      // Final stock check
      if (product.availableStock < 0) {
        throw new AppError('Product out of stock', 409);
      }

      // Mark reservation as completed
      reservation.status = ReservationStatus.COMPLETED;
      await reservation.save({ transaction });

      // Create purchase record
      const purchase = await Purchase.create(
        {
          userId,
          productId: product.id,
          reservationId: reservation.id,
          quantity: 1,
        },
        { transaction },
      );

      const user = await User.findByPk(userId, { attributes: ['username'], transaction });
      return { purchase, product, username: user?.username || 'Unknown' };
    });

    // Broadcast real-time stock update
    getIO().emit('stock:update', {
      productId: result.product.id,
      availableStock: result.product.availableStock,
    });

    getIO().emit('purchase:new', {
      productId: result.product.id,
      userId,
      username: result.username,
      purchasedAt: result.purchase.createdAt,
    });

    logger.info(`Purchase completed: user=${userId} product=${result.product.id} reservation=${reservationId}`);

    return {
      purchase: {
        id: result.purchase.id,
        productId: result.purchase.productId,
        createdAt: result.purchase.createdAt,
      },
      product: {
        id: result.product.id,
        availableStock: result.product.availableStock,
      },
    };
  }
}

export const purchaseService = new PurchaseService();
