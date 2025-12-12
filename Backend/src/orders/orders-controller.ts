import { Response } from 'express';
import { AuthRequest } from '../middleware/auth-middleware';
const db = require('../../models');

export class OrdersController {
  static create = async (req: AuthRequest, res: Response) => {
    const maxRetries = 20;
    let attempts = 0;

    while (attempts < maxRetries) {
      // 1. Start a Transaction
      const t = await db.sequelize.transaction();

      try {
        if (!req.user || req.user.type !== 'customer') {
          await t.rollback(); // Cancel transaction
          return res.status(403).json({ message: 'Only customers can create orders' });
        }

        const { dealer_id, items, deliveryAddress, paymentMethod, shippingCost } = req.body;

        // Basic Validation
        if (attempts === 0) {
           // ... (Your existing validation logic) ...
        }

        let totalAmount = items.reduce((sum: number, item: any) => {
          return sum + (item.quantity * item.unitPrice);
        }, 0);

        if (shippingCost) totalAmount += parseFloat(shippingCost);

        // 2. Create Order (Pass transaction 't')
        const order = await db.Order.create({
          customer_id: req.user.id,
          dealer_id,
          totalAmount,
          deliveryAddress,
          paymentMethod,
          paymentDate: new Date(),
          shippingCost: shippingCost || 0,
          status: 'pending',
          paymentStatus: 'pending'
        }, { transaction: t }); // <--- IMPORTANT

        // 3. Create Items (Pass transaction 't')
        await Promise.all(
          items.map((item: any) => 
            db.OrderItem.create({
              order_id: order.order_id,
              substance_id: item.substance_id,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subTotal: item.quantity * item.unitPrice 
            }, { transaction: t }) // <--- IMPORTANT
          )
        );

        // 4. Commit (Save everything)
        await t.commit();

        // 5. Fetch Final Result (New transaction not strictly needed for read, but clean)
        const completeOrder = await db.Order.findByPk(order.order_id, {
          include: [
            {
              model: db.OrderItem,
              as: 'items',
              include: [{ model: db.Substance, as: 'substance' }]
            },
            // ... (Your other includes)
          ]
        });

        return res.status(201).json({
          message: 'Order created successfully',
          order: completeOrder
        });

      } catch (error: any) {
        // 6. Rollback (Undo everything if ANY error happens)
        await t.rollback();

        console.error(`Error creating order (attempt ${attempts + 1}):`, error.message);
        
        // Debugging helper
        if (error.name === 'SequelizeValidationError') {
            console.log('VALIDATION DEBUG:', error.errors.map((e: any) => e.message));
        }

        // Retry Logic
        if ((error.code === '23505' || error.parent?.code === '23505') && 
            (error.constraint?.includes('_pkey') || error.parent?.constraint?.includes('_pkey'))) {
          attempts++;
          // ... (Your existing sequence retry logic) ...
          continue;
        }
        
        // If it's NOT a duplicate ID error, stop looping and fail
        return res.status(500).json({ 
          message: 'Error creating order', 
          error: error.message 
        });
      }
    }
  }

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
            as: 'shipment',
            required: false
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

      // ... existing customer check ...

      // --- FIX IS HERE: Change order.status to order.orderStatus ---
      // We check both just to be safe, but orderStatus is the real DB column
      const currentStatus = order.orderStatus || order.status; 
      
      if (currentStatus !== 'pending') {
        return res.status(400).json({ 
            message: `Cannot delete orders that are not pending. Current status: ${currentStatus}` 
        });
      }
      // -------------------------------------------------------------

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