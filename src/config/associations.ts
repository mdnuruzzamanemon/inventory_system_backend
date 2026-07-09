import { User } from '../modules/users/user.model';
import { Drop } from '../modules/drops/drop.model';
import { Product } from '../modules/products/product.model';
import { Reservation } from '../modules/reservations/reservation.model';
import { Purchase } from '../modules/purchases/purchase.model';

export function setupAssociations(): void {
  User.hasMany(Reservation, { foreignKey: 'userId', as: 'reservations' });
  Reservation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  User.hasMany(Purchase, { foreignKey: 'userId', as: 'purchases' });
  Purchase.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  Drop.hasMany(Product, { foreignKey: 'dropId', as: 'products' });
  Product.belongsTo(Drop, { foreignKey: 'dropId', as: 'drop' });

  Product.hasMany(Reservation, { foreignKey: 'productId', as: 'reservations' });
  Reservation.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

  Product.hasMany(Purchase, { foreignKey: 'productId', as: 'purchases' });
  Purchase.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

  Reservation.hasOne(Purchase, { foreignKey: 'reservationId', as: 'purchase' });
  Purchase.belongsTo(Reservation, { foreignKey: 'reservationId', as: 'reservation' });
}
