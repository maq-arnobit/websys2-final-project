import { Response } from 'express';
import { AuthRequest } from '../middleware/auth-middleware';
import { UserController } from '../controllers/users-controllers';
const db = require('../../models');

export class ProviderController extends UserController {
  constructor() {
    super('provider', db.Provider, 'provider_id');
  }

  static async getSubstances(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const substances = await db.Substance.findAll({
        where: { provider_id: id }
      });

      return res.status(200).json({ substances });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching substances', error: error.message });
    }
  }

  static async getTransportOptions(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const transportOptions = await db.ProviderTransport.findAll({
        where: { provider_id: id }
      });

      return res.status(200).json({ transportOptions });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching transport options', error: error.message });
    }
  }

  static async getPurchaseOrders(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (req.user?.type !== 'provider' || req.user?.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Cannot view other provider purchase orders' });
      }

      const purchaseOrders = await db.PurchaseOrder.findAll({
        where: { provider_id: id },
        include: [
          { model: db.Dealer, as: 'dealer', attributes: { exclude: ['password'] } },
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