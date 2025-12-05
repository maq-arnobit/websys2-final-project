//customer controller
import { Response } from 'express';
import { AuthRequest } from '../auth/auth-middleware';
import { hashPassword } from '../auth/auth-middleware';
const db = require('../../models');

export class CustomerController {
 

  // Get customer by ID - only their own profile
  static async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
     
      if (!req.user || req.user.type !== 'customer' || req.user.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Access denied. You can only view your own profile.' });
      }

      const customer = await db.Customer.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: db.Order,
            as: 'orders'
          }
        ]
      });

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      return res.status(200).json({ customer });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching customer', error: error.message });
    }
  }

  // Update customer - only their own profile
  static async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { username, email, address, status, password } = req.body;

      
      if (!req.user || req.user.type !== 'customer' || req.user.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Access denied. You can only update your own profile.' });
      }

      const customer = await db.Customer.findByPk(id);

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      const updateData: any = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (address) updateData.address = address;
      
      
      if (password) updateData.password = await hashPassword(password);

      await customer.update(updateData);

      const updatedCustomer = await db.Customer.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      return res.status(200).json({
        message: 'Customer updated successfully',
        customer: updatedCustomer
      });
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Username or email already exists' });
      }
      return res.status(500).json({ message: 'Error updating customer', error: error.message });
    }
  }

  // Delete customer - only their own account
  static async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

     
      if (!req.user || req.user.type !== 'customer' || req.user.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Access denied. You can only delete your own account.' });
      }

      const customer = await db.Customer.findByPk(id);

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      await customer.destroy();

      return res.status(200).json({ message: 'Customer account deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error deleting customer', error: error.message });
    }
  }

  // Get customer orders - only their own orders
  static async getOrders(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      
      if (!req.user || req.user.type !== 'customer' || req.user.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Access denied. You can only view your own orders.' });
      }

      const orders = await db.Order.findAll({
        where: { customer_id: id },
        include: [
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
