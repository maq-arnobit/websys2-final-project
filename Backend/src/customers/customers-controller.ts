import { Response } from 'express';
import { AuthRequest } from '../middleware/auth-middleware';
import { UserController } from '../controllers/users-controllers';
const db = require('../../models');

export class CustomerController extends UserController {
  constructor() {
    super('customer', db.Customer, 'customer_id');
  }

  static async getOrders(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!req.user || req.user.type !== 'customer' || req.user.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const orders = await db.Order.findAll({
        where: { customer_id: id },
        include: [
          {
            model: db.OrderItem,
            as: 'items',
            include: [{ model: db.Substance, as: 'substance' }]
          },
          {
            model: db.Dealer,
            as: 'dealer',
            attributes: { exclude: ['password'] }
          },
          {
            model: db.Shipment,
            as: 'shipment'
          }
        ]
      });

      return res.status(200).json({ orders });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
  }
}