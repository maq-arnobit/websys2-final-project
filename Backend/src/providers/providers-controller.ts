import { Response } from 'express';
import { AuthRequest } from '../auth/auth-middleware';
import { hashPassword } from '../auth/auth-middleware';
const db = require('../../models');

export class ProviderController {
  // Get provider by ID
  static async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const provider = await db.Provider.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: db.Substance,
            as: 'substances'
          },
          {
            model: db.ProviderTransport,
            as: 'transportOptions'
          }
        ]
      });

      if (!provider) {
        return res.status(404).json({ message: 'Provider not found' });
      }

      return res.status(200).json({ provider });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching provider', error: error.message });
    }
  }


  static async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { username, email, businessName, status, password } = req.body;


      if (req.user?.type !== 'provider' || req.user?.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Cannot update other provider profiles' });
      }

      const provider = await db.Provider.findByPk(id);

      if (!provider) {
        return res.status(404).json({ message: 'Provider not found' });
      }

      const updateData: any = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (businessName) updateData.businessName = businessName;
      if (status) updateData.status = status;
      if (password) updateData.password = await hashPassword(password);

      await provider.update(updateData);

      const updatedProvider = await db.Provider.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      return res.status(200).json({
        message: 'Provider updated successfully',
        provider: updatedProvider
      });
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Username or email already exists' });
      }
      return res.status(500).json({ message: 'Error updating provider', error: error.message });
    }
  }

  // Delete provider
  static async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

    
      if (req.user?.type !== 'provider' || req.user?.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Cannot delete other provider accounts' });
      }

      const provider = await db.Provider.findByPk(id);

      if (!provider) {
        return res.status(404).json({ message: 'Provider not found' });
      }

      await provider.destroy();

      return res.status(200).json({ message: 'Provider deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error deleting provider', error: error.message });
    }
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
          {
            model: db.Dealer,
            as: 'dealer',
            attributes: { exclude: ['password'] }
          },
          {
            model: db.Substance,
            as: 'substance'
          },
          {
            model: db.ProviderTransport,
            as: 'transport'
          }
        ]
      });

      return res.status(200).json({ purchaseOrders });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching purchase orders', error: error.message });
    }
  }
}