import sequelize from '../../config/database';
import { AppError } from '../../shared/errors';
import { Drop } from './drop.model';
import { Product } from '../products/product.model';
import { Purchase } from '../purchases/purchase.model';
import { User } from '../users/user.model';
import { CreateDropInput } from './drop.validation';
import { Op } from 'sequelize';

export class DropService {
  async create(input: CreateDropInput) {
    const result = await sequelize.transaction(async (transaction) => {
      const drop = await Drop.create(
        {
          name: input.name,
          description: input.description || '',
          startTime: input.startTime ? new Date(input.startTime) : new Date(),
          endTime: input.endTime ? new Date(input.endTime) : null,
        },
        { transaction },
      );

      const products = await Promise.all(
        input.products.map((p) =>
          Product.create(
            {
              dropId: drop.id,
              name: p.name,
              price: p.price,
              totalStock: p.stock,
              availableStock: p.stock,
            },
            { transaction },
          ),
        ),
      );

      return { drop, products };
    });

    return result;
  }

  async getActiveDrops() {
    const now = new Date();

    const drops = await Drop.findAll({
      where: {
        startTime: { [Op.lte]: now },
        [Op.or]: [
          { endTime: { [Op.gte]: now } },
          { endTime: null },
        ],
      },
      include: [
        {
          model: Product,
          as: 'products',
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const productIds = drops.flatMap((d) => (d as unknown as { products: Array<{ id: string }> }).products.map((p) => p.id));

    const topPurchasesMap = new Map<string, Array<{ username: string; purchasedAt: string }>>();

    if (productIds.length > 0) {
      const purchases = await Purchase.findAll({
        where: { productId: productIds },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      for (const purchase of purchases) {
        const pid = purchase.productId;
        if (!topPurchasesMap.has(pid)) {
          topPurchasesMap.set(pid, []);
        }
        const list = topPurchasesMap.get(pid)!;
        const purchaseUser = (purchase as unknown as { user: { username: string } }).user;
        if (list.length < 3 && purchaseUser) {
          list.push({
            username: purchaseUser.username,
            purchasedAt: purchase.createdAt.toISOString(),
          });
        }
      }
    }

    const result = drops.map((drop) => {
      const dropJson = drop.toJSON() as unknown as Record<string, unknown>;
      const products = (dropJson.products ?? []) as Array<Record<string, unknown>>;

      return {
        ...dropJson,
        products: products.map((product) => {
          const pid = product.id as string;
          return {
            ...product,
            recentPurchasers: topPurchasesMap.get(pid) || [],
          };
        }),
      };
    });

    return result;
  }
}

export const dropService = new DropService();
