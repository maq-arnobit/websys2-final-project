import { Response } from 'express';
import { AuthRequest } from '../auth/auth-middleware';
import { hashPassword } from '../utils/utils';
import { getImageUrl } from '../file-upload/upload-middleware';

import db from '../../models';

export class DealerController {
  async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!req.user || req.user.type !== 'dealer' || req.user.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Cannot access other profiles' });
      }

      const dealer = await db.Dealer.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      if (!dealer) {
        return res.status(404).json({ message: 'Dealer not found' });
      }

      return res.status(200).json({ dealer });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching dealer', error: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { password, ...otherData } = req.body;

      if (!req.user || req.user.type !== 'dealer' || req.user.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Cannot update other profiles' });
      }

      const dealer = await db.Dealer.findByPk(id);

      if (!dealer) {
        return res.status(404).json({ message: 'Dealer not found' });
      }

      const updateData: any = { ...otherData };
      if (password) {
        updateData.password = await hashPassword(password);
      }

      await dealer.update(updateData);

      const updatedDealer = await db.Dealer.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      return res.status(200).json({
        message: 'Dealer updated successfully',
        dealer: updatedDealer
      });
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Username or email already exists' });
      }
      return res.status(500).json({ message: 'Error updating dealer', error: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!req.user || req.user.type !== 'dealer' || req.user.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Cannot delete other accounts' });
      }

      const dealer = await db.Dealer.findByPk(id);

      if (!dealer) {
        return res.status(404).json({ message: 'Dealer not found' });
      }

      await dealer.destroy();

      return res.status(200).json({ message: 'Dealer account deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error deleting dealer', error: error.message });
    }
  }

  async getInventory(req: AuthRequest, res: Response) {
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

      const inventoryWithImages = inventory.map((item: any) => {
        const itemData = item.toJSON();
        return {
          ...itemData,
          image_url: getImageUrl('inventory', item.inventory_id),
          substance: {
            ...itemData.substance,
            image_url: getImageUrl('substance', item.substance_id)
          }
        };
      });

      return res.status(200).json({ inventory: inventoryWithImages });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching inventory', error: error.message });
    }
  }

  async getOrders(req: AuthRequest, res: Response) {
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

      const ordersWithImages = orders.map((order: any) => {
        const orderData = order.toJSON();
        return {
          ...orderData,
          items: orderData.items?.map((item: any) => ({
            ...item,
            substance: item.substance ? {
              ...item.substance,
              image_url: getImageUrl('substance', item.substance.substance_id)
            } : null
          }))
        };
      });

      return res.status(200).json({ orders: ordersWithImages });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
  }

  async getPurchaseOrders(req: AuthRequest, res: Response) {
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

      const purchaseOrdersWithImages = purchaseOrders.map((po: any) => {
        const poData = po.toJSON();
        return {
          ...poData,
          substance: poData.substance ? {
            ...poData.substance,
            image_url: getImageUrl('substance', poData.substance.substance_id)
          } : null
        };
      });

      return res.status(200).json({ purchaseOrders: purchaseOrdersWithImages });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching purchase orders', error: error.message });
    }
  }
}