import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../config/database';
import { Drop } from '../drops/drop.model';

interface ProductAttributes {
  id: string;
  dropId: string;
  name: string;
  price: number;
  totalStock: number;
  availableStock: number;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

interface ProductCreationAttributes extends Optional<ProductAttributes, 'id'> {}

export class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: string;
  public dropId!: string;
  public name!: string;
  public price!: number;
  public totalStock!: number;
  public availableStock!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    dropId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Drop,
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    availableStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'products',
    timestamps: true,
  },
);
