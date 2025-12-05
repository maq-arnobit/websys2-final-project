// src/controllers/order.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../auth/auth-middleware';
const db = require('../../models');

export class OrderController {
  // Get all orders
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const { customer_id, dealer_id, orderStatus } = req.query;
      const where: any = {};

      if (customer_id) where.customer_id = customer_id;
      if (dealer_id) where.dealer_id = dealer_id;
      if (orderStatus) where.orderStatus = orderStatus;

      const orders = await db.Order.findAll({
        where,
        include: [
          {
            model: db.Customer,
            as: 'customer',
            attributes: { exclude: ['password'] }
          },
          {
            model: db.Dealer,
            as: 'dealer',
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

  // Get order by ID
  static async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const order = await db.Order.findByPk(id, {
        include: [
          {
            model: db.Customer,
            as: 'customer',
            attributes: { exclude: ['password'] }
          },
          {
            model: db.Dealer,
            as: 'dealer',
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

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Check access permissions
      if (req.user?.type === 'customer' && order.customer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot view other customer orders' });
      }

      if (req.user?.type === 'dealer' && order.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot view other dealer orders' });
      }

      return res.status(200).json({ order });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
  }

  // Create order (Customer only)
  static async create(req: AuthRequest, res: Response) {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { dealer_id, items, deliveryAddress, paymentMethod, shippingCost } = req.body;

      if (!req.user || req.user.type !== 'customer') {
        await transaction.rollback();
        return res.status(403).json({ message: 'Only customers can create orders' });
      }

      if (!dealer_id || !items || !Array.isArray(items) || items.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Dealer ID and items are required' });
      }

      
      const dealer = await db.Dealer.findByPk(dealer_id);
      if (!dealer) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Dealer not found' });
      }


      let totalAmount = 0;


      const order = await db.Order.create({
        customer_id: req.user.id,
        dealer_id,
        orderDate: new Date(),
        orderStatus: 'pending',
        totalAmount: 0,
        shippingCost: shippingCost || 0,
        deliveryAddress: deliveryAddress || '',
        paymentStatus: 'pending',
        paymentMethod: paymentMethod || ''
      }, { transaction });

  
      for (const item of items) {
        const { substance_id, quantity, unitPrice } = item;

        if (!substance_id || !quantity || !unitPrice) {
          await transaction.rollback();
          return res.status(400).json({ message: 'Each item must have substance_id, quantity, and unitPrice' });
        }

        const subTotal = quantity * unitPrice;
        totalAmount += subTotal;

        await db.OrderItem.create({
          order_id: order.order_id,
          substance_id,
          quantity,
          unitPrice,
          subTotal
        }, { transaction });

        // Update inventory
        const inventory = await db.Inventory.findOne({
          where: { dealer_id, substance_id },
          transaction
        });

        if (inventory) {
          if (inventory.quantityAvailable < quantity) {
            await transaction.rollback();
            return res.status(400).json({ message: `Insufficient inventory for substance ${substance_id}` });
          }
          await inventory.update({
            quantityAvailable: inventory.quantityAvailable - quantity
          }, { transaction });
        }
      }

      // Update order total amount including shipping cost
      totalAmount += parseFloat(shippingCost || 0);
      await order.update({ totalAmount }, { transaction });

      await transaction.commit();

      const createdOrder = await db.Order.findByPk(order.order_id, {
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
          }
        ]
      });

      return res.status(201).json({
        message: 'Order created successfully',
        order: createdOrder
      });
    } catch (error: any) {
      await transaction.rollback();
      return res.status(500).json({ message: 'Error creating order', error: error.message });
    }
  }

  // Update order
  static async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { orderStatus, paymentStatus, paymentMethod, paymentDate, transactionReference } = req.body;

      const order = await db.Order.findByPk(id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Check permissions
      if (req.user?.type === 'customer' && order.customer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot update other customer orders' });
      }

      if (req.user?.type === 'dealer' && order.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot update other dealer orders' });
      }

      const updateData: any = {};
      if (orderStatus) updateData.orderStatus = orderStatus;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      if (paymentMethod) updateData.paymentMethod = paymentMethod;
      if (paymentDate) updateData.paymentDate = paymentDate;
      if (transactionReference) updateData.transactionReference = transactionReference;

      await order.update(updateData);

      return res.status(200).json({
        message: 'Order updated successfully',
        order
      });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error updating order', error: error.message });
    }
  }

  // Delete/Cancel order
  static async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const order = await db.Order.findByPk(id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Only customer can cancel their own orders
      if (req.user?.type === 'customer' && order.customer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot cancel other customer orders' });
      }

      if (order.orderStatus === 'shipped' || order.orderStatus === 'delivered') {
        return res.status(400).json({ message: 'Cannot cancel shipped or delivered orders' });
      }

      await order.update({ orderStatus: 'cancelled' });

      return res.status(200).json({ message: 'Order cancelled successfully' });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error cancelling order', error: error.message });
    }
  }
}