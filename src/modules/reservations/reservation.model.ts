import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../config/database';
import { User } from '../users/user.model';
import { Product } from '../products/product.model';

export enum ReservationStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

interface ReservationAttributes {
  id: string;
  userId: string;
  productId: string;
  status: ReservationStatus;
  expiresAt: Date;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

interface ReservationCreationAttributes extends Optional<ReservationAttributes, 'id'> {}

export class Reservation extends Model<ReservationAttributes, ReservationCreationAttributes> implements ReservationAttributes {
  public id!: string;
  public userId!: string;
  public productId!: string;
  public status!: ReservationStatus;
  public expiresAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Reservation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Product,
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ReservationStatus)),
      allowNull: false,
      defaultValue: ReservationStatus.ACTIVE,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'reservations',
    timestamps: true,
  },
);
