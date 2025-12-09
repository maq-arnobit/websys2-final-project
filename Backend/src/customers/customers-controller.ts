import { Response } from 'express';
import { AuthRequest } from '../auth/auth-middleware';
import { hashPassword } from '../utils/utils';

import db from '../../models';

export class CustomerController {
  async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!req.user || req.user.type !== 'customer' || req.user.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Cannot access other profiles' });
      }

      const customer = await db.Customer.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      return res.status(200).json({ customer });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching customer', error: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { password, ...otherData } = req.body;

      if (!req.user || req.user.type !== 'customer' || req.user.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Cannot update other profiles' });
      }

      const customer = await db.Customer.findByPk(id);

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      const updateData: any = { ...otherData };
      if (password) {
        updateData.password = await hashPassword(password);
      }

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

  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!req.user || req.user.type !== 'customer' || req.user.id !== parseInt(id)) {
        return res.status(403).json({ message: 'Cannot delete other accounts' });
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

  async getOrders(req: AuthRequest, res: Response) {
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