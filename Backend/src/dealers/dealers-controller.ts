import { Response } from 'express';
import { AuthRequest } from '../middleware/auth-middleware';
import { UserController } from '../controllers/users-controllers';
const db = require('../../models');

export class DealerController extends UserController {
  constructor() {
    super('dealer', db.Dealer, 'dealer_id');
  }

  static async getInventory(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (req.user?.type === 'dealer' && req.user?.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Cannot access other dealer inventory' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const inventory = await db.Inventory.findAll({
      where: { dealer_id: id },
      include: [{
        model: db.Substance,
        as: 'substance',
        include: [{ model: db.Provider, as: 'provider', attributes: { exclude: ['password'] } }]
      }]
    });

    return res.status(200).json({ inventory });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching inventory', error: error.message });
  }
}

  static async getOrders(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (req.user?.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Cannot access other dealer orders' });
      }

      const orders = await db.Order.findAll({
        where: { dealer_id: id },
        include: [
          { model: db.Customer, as: 'customer', attributes: { exclude: ['password'] } },
          {
            model: db.OrderItem,
            as: 'items',
            include: [{ model: db.Substance, as: 'substance' }]
          },
          { model: db.Shipment, as: 'shipment' }
        ]
      });

      return res.status(200).json({ orders });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
  }

  static async getPurchaseOrders(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (req.user?.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Cannot access other dealer purchase orders' });
      }

      const purchaseOrders = await db.PurchaseOrder.findAll({
        where: { dealer_id: id },
        include: [
          { model: db.Provider, as: 'provider', attributes: { exclude: ['password'] } },
          { model: db.Substance, as: 'substance' },
          { model: db.ProviderTransport, as: 'transport' }
        ]
      });

      return res.status(200).json({ purchaseOrders });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching purchase orders', error: error.message });
    }
  }
}
