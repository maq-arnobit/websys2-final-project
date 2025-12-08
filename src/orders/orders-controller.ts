import { Response } from 'express';
import { AuthRequest } from '../middleware/auth-middleware';
const db = require('../../models');

export class OrdersController {
  static create = async (req: AuthRequest, res: Response) => {
    const maxRetries = 20;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        if (!req.user || req.user.type !== 'customer') {
          return res.status(403).json({ message: 'Only customers can create orders' });
        }

        const { dealer_id, items, deliveryAddress, paymentMethod, shippingCost } = req.body;

        if (attempts === 0) {
          console.log('Creating order with data:', { dealer_id, items, deliveryAddress, paymentMethod, shippingCost });
          
          if (!dealer_id || !items || !Array.isArray(items) || items.length === 0 || !deliveryAddress || !paymentMethod) {
            return res.status(400).json({ 
              message: 'Missing required fields: dealer_id, items (array), deliveryAddress, paymentMethod' 
            });
          }

          for (const item of items) {
            if (!item.substance_id || !item.quantity || !item.unitPrice) {
              return res.status(400).json({ 
                message: 'Each item must have: substance_id, quantity, unitPrice' 
              });
            }
          }

          const dealer = await db.Dealer.findByPk(dealer_id);
          if (!dealer) {
            return res.status(404).json({ message: 'Dealer not found' });
          }

          for (const item of items) {
            const substance = await db.Substance.findByPk(item.substance_id);
            if (!substance) {
              return res.status(404).json({ 
                message: `Substance with id ${item.substance_id} not found` 
              });
            }
          }
        }

        console.log(`Attempt ${attempts + 1}: Creating order...`);

        let totalCost = items.reduce((sum: number, item: any) => {
          return sum + (item.quantity * item.unitPrice);
        }, 0);

        if (shippingCost) {
          totalCost += parseFloat(shippingCost);
        }

        console.log('Calculated total cost:', totalCost);

        const order = await db.Order.create({
          customer_id: req.user.id,
          dealer_id,
          totalAmount: Math.round(totalCost * 100) / 100,
          deliveryAddress,
          paymentMethod,
          paymentDate: new Date(),
          shippingCost: shippingCost || 0,
          status: 'pending',
          paymentStatus: 'pending'
        });

        console.log('Order created with ID:', order.order_id);

        const orderItems = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          console.log(`Creating order item ${i + 1}:`, item);
          
          try {
            const orderItem = await db.OrderItem.create({
              order_id: order.order_id,
              substance_id: item.substance_id,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subTotal: Math.round(item.quantity * item.unitPrice * 100) / 100
            });
            orderItems.push(orderItem);
            console.log(`Order item ${i + 1} created successfully`);
          } catch (itemError: any) {
            console.error(`Error creating order item ${i + 1}:`, itemError.message);
            await order.destroy();
            throw itemError;
          }
        }

        console.log('All order items created. Fetching complete order...');

        const completeOrder = await db.Order.findByPk(order.order_id, {
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
              model: db.Customer,
              as: 'customer',
              attributes: { exclude: ['password'] }
            }
          ]
        });

        console.log('Order creation complete!');

        return res.status(201).json({
          message: 'Order created successfully',
          order: completeOrder
        });
      } catch (error: any) {
        console.error(`Error creating order (attempt ${attempts + 1}):`, error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          constraint: error.constraint,
          parent: error.parent
        });
        
        if ((error.code === '23505' || error.parent?.code === '23505') && 
            (error.constraint?.includes('_pkey') || error.parent?.constraint?.includes('_pkey'))) {
          attempts++;
          
          try {
            await db.sequelize.query(`SELECT nextval('orders_order_id_seq')`);
            console.log('Advanced orders sequence, retrying...');
            continue;
          } catch (seqError) {
            console.error('Error advancing sequence:', seqError);
          }
          
          if (attempts >= maxRetries) {
            return res.status(500).json({ 
              message: `Unable to create order after ${maxRetries} attempts. Please contact support.`,
              error: 'ID generation failed'
            });
          }
          continue;
        }
        
        return res.status(500).json({ 
          message: 'Error creating order', 
          error: error.message,
          details: process.env.NODE_ENV === 'development' ? error : undefined
        });
      }
    }
  };

  static getAll = async (req: AuthRequest, res: Response) => {
    try {
      const orders = await db.Order.findAll({
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
            model: db.Customer,
            as: 'customer',
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
      return res.status(500).json({ 
        message: 'Error fetching orders', 
        error: error.message 
      });
    }
  };

  static getById = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const order = await db.Order.findByPk(id, {
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
            model: db.Customer,
            as: 'customer',
            attributes: { exclude: ['password'] }
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

      return res.status(200).json({ order });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error fetching order', 
        error: error.message 
      });
    }
  };

  static update = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const order = await db.Order.findByPk(id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (req.user?.type === 'customer' && order.customer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot update other customers orders' });
      }

      if (req.user?.type === 'dealer' && order.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot update orders for other dealers' });
      }

      await order.update(req.body);

      const updatedOrder = await db.Order.findByPk(id, {
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
            model: db.Customer,
            as: 'customer',
            attributes: { exclude: ['password'] }
          }
        ]
      });

      return res.status(200).json({
        message: 'Order updated successfully',
        order: updatedOrder
      });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error updating order', 
        error: error.message 
      });
    }
  };

  static delete = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const order = await db.Order.findByPk(id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (req.user?.type === 'customer' && order.customer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot delete other customers orders' });
      }

      if (order.orderStatus !== 'pending') {
        return res.status(400).json({ message: 'Cannot delete orders that are not pending' });
      }

      await order.destroy();

      return res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error deleting order', 
        error: error.message 
      });
    }
  };
}