import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../config/database';

interface DropAttributes {
  id: string;
  name: string;
  description: string;
  startTime: Date;
  endTime: Date | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

interface DropCreationAttributes extends Optional<DropAttributes, 'id' | 'endTime'> {}

export class Drop extends Model<DropAttributes, DropCreationAttributes> implements DropAttributes {
  public id!: string;
  public name!: string;
  public description!: string;
  public startTime!: Date;
  public endTime!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Drop.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'drops',
    timestamps: true,
  },
);
