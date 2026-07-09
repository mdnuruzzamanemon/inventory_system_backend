import { Op } from 'sequelize';
import sequelize from '../../config/database';
import { env } from '../../config';
import { AppError } from '../../shared/errors';
import { logger } from '../../shared/utils';
import { Product } from '../products/product.model';
import { Reservation, ReservationStatus } from './reservation.model';
import { getIO } from '../../socket/handlers';

export class ReservationService {
  async reserve(userId: string, productId: string) {
    const result = await sequelize.transaction(async (transaction) => {
      // Row-level lock to prevent race conditions
      const product = await Product.findByPk(productId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      if (product.availableStock <= 0) {
        throw new AppError('Product out of stock', 409);
      }

      // Check if user already has active reservation for this product
      const existingReservation = await Reservation.findOne({
        where: {
          userId,
          productId,
          status: ReservationStatus.ACTIVE,
          expiresAt: { [Op.gt]: new Date() },
        },
        transaction,
      });

      if (existingReservation) {
        throw new AppError('You already have an active reservation for this product', 409);
      }

      const expiresAt = new Date(Date.now() + env.reservationTtlSeconds * 1000);

      const reservation = await Reservation.create(
        {
          userId,
          productId,
          status: ReservationStatus.ACTIVE,
          expiresAt,
        },
        { transaction },
      );

      product.availableStock -= 1;
      await product.save({ transaction });

      return { reservation, product };
    });

    // Schedule auto-expiry
    this.scheduleExpiry(result.reservation.id);

    // Broadcast real-time stock update
    getIO().emit('stock:update', {
      productId: result.product.id,
      availableStock: result.product.availableStock,
    });

    logger.info(`Reservation created: user=${userId} product=${productId} expires=${result.reservation.expiresAt}`);

    return {
      reservation: {
        id: result.reservation.id,
        productId: result.reservation.productId,
        expiresAt: result.reservation.expiresAt,
        status: result.reservation.status,
      },
      product: {
        id: result.product.id,
        availableStock: result.product.availableStock,
      },
    };
  }

  private scheduleExpiry(reservationId: string) {
    setTimeout(async () => {
      try {
        await this.expireReservation(reservationId);
      } catch (error) {
        logger.error(`Failed to expire reservation ${reservationId}:`, error);
      }
    }, env.reservationTtlSeconds * 1000);
  }

  async expireReservation(reservationId: string) {
    const result = await sequelize.transaction(async (transaction) => {
      const reservation = await Reservation.findByPk(reservationId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!reservation || reservation.status !== ReservationStatus.ACTIVE) {
        return null;
      }

      reservation.status = ReservationStatus.EXPIRED;
      await reservation.save({ transaction });

      const product = await Product.findByPk(reservation.productId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (product) {
        product.availableStock += 1;
        await product.save({ transaction });
      }

      return { reservation, product };
    });

    if (result) {
      getIO().emit('stock:update', {
        productId: result.product!.id,
        availableStock: result.product!.availableStock,
      });

      getIO().emit('reservation:expired', {
        reservationId: result.reservation.id,
        productId: result.reservation.productId,
      });

      logger.info(`Reservation expired: id=${reservationId}`);
    }
  }

  async getUserActiveReservations(userId: string) {
    const reservations = await Reservation.findAll({
      where: {
        userId,
        status: ReservationStatus.ACTIVE,
        expiresAt: { [Op.gt]: new Date() },
      },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price'],
        },
      ],
    });

    return reservations;
  }

  async validateReservation(userId: string, reservationId: string, productId: string) {
    const reservation = await Reservation.findOne({
      where: {
        id: reservationId,
        userId,
        productId,
        status: ReservationStatus.ACTIVE,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    return reservation;
  }
}

export const reservationService = new ReservationService();
