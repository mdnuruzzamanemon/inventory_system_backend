import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../config/database';
import { User } from '../users/user.model';
import { Product } from '../products/product.model';
import { Reservation } from '../reservations/reservation.model';

interface PurchaseAttributes {
  id: string;
  userId: string;
  productId: string;
  reservationId: string;
  quantity: number;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

interface PurchaseCreationAttributes extends Optional<PurchaseAttributes, 'id'> {}

export class Purchase extends Model<PurchaseAttributes, PurchaseCreationAttributes> implements PurchaseAttributes {
  public id!: string;
  public userId!: string;
  public productId!: string;
  public reservationId!: string;
  public quantity!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Purchase.init(
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
    reservationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Reservation,
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'purchases',
    timestamps: true,
  },
);
