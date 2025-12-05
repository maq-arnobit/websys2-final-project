import { Response } from 'express';
import { AuthRequest } from '../auth/auth-middleware';
import { hashPassword } from '../auth/auth-middleware';
const db = require('../../models');

export class DealerController {

  // Get dealer by ID
  static async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

     
      if (req.user?.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Cannot access other dealer profiles' });
      }

      const dealer = await db.Dealer.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: db.Inventory,
            as: 'inventory',
            include: [
              {
                model: db.Substance,
                as: 'substance'
              }
            ]
          }
        ]
      });

      if (!dealer) {
        return res.status(404).json({ message: 'Dealer not found' });
      }

      return res.status(200).json({ dealer });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching dealer', error: error.message });
    }
  }

  // Update dealer
  static async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { username, email, warehouse, status, password } = req.body;


      if (req.user?.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Cannot update other dealer profiles' });
      }

      const dealer = await db.Dealer.findByPk(id);

      if (!dealer) {
        return res.status(404).json({ message: 'Dealer not found' });
      }

      const updateData: any = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (warehouse) updateData.warehouse = warehouse;
      if (status) updateData.status = status;
      if (password) updateData.password = await hashPassword(password);

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

  // Delete dealer
  static async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

     
      if (req.user?.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Cannot delete other dealer accounts' });
      }

      const dealer = await db.Dealer.findByPk(id);

      if (!dealer) {
        return res.status(404).json({ message: 'Dealer not found' });
      }

      await dealer.destroy();

      return res.status(200).json({ message: 'Dealer deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error deleting dealer', error: error.message });
    }
  }

  // Get dealer inventory 
  static async getInventory(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

  
      if (req.user?.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Cannot access other dealer inventory' });
      }

      const inventory = await db.Inventory.findAll({
        where: { dealer_id: id },
        include: [
          {
            model: db.Substance,
            as: 'substance',
            include: [
              {
                model: db.Provider,
                as: 'provider',
                attributes: { exclude: ['password'] }
              }
            ]
          }
        ]
      });

      return res.status(200).json({ inventory });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching inventory', error: error.message });
    }
  }

  // Get dealer orders 
  static async getOrders(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      
      if (req.user?.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Cannot access other dealer orders' });
      }

      const orders = await db.Order.findAll({
        where: { dealer_id: id },
        include: [
          {
            model: db.Customer,
            as: 'customer',
            attributes: { exclude: ['password'] }
          },
          {
            model: db.OrderItem,
            as: 'items',
            include: [
              {
                model: db.Substance,
                as: 'substance'
              }
            ]
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

  // Get dealer purchase orders
  static async getPurchaseOrders(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

  
      if (req.user?.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Cannot access other dealer purchase orders' });
      }

      const purchaseOrders = await db.PurchaseOrder.findAll({
        where: { dealer_id: id },
        include: [
          {
            model: db.Provider,
            as: 'provider',
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
