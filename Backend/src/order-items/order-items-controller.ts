import { Response } from 'express';
import { AuthRequest } from '../middleware/auth-middleware';
const db = require('../../models');

export class OrderItemsController {
  static create = async (req: AuthRequest, res: Response) => {
    const maxRetries = 20;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        if (!req.user || req.user.type !== 'customer') {
          return res.status(403).json({ message: 'Only customers can create order items' });
        }

        const { order_id, substance_id, quantity, unitPrice } = req.body;

        if (attempts === 0) {
          if (!order_id || !substance_id || !quantity || !unitPrice) {
            return res.status(400).json({ 
              message: 'Missing required fields: order_id, substance_id, quantity, unitPrice' 
            });
          }

          if (quantity < 1) {
            return res.status(400).json({ 
              message: 'Quantity must be at least 1' 
            });
          }
        }

        const order = await db.Order.findByPk(order_id);
        
        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }

        if (order.customer_id !== req.user.id) {
          return res.status(403).json({ message: 'Cannot add items to other customers orders' });
        }

        if (order.orderStatus !== 'pending') {
          return res.status(400).json({ 
            message: 'Cannot add items to orders that are not pending' 
          });
        }

        const substance = await db.Substance.findByPk(substance_id);
        
        if (!substance) {
          return res.status(404).json({ message: 'Substance not found' });
        }

        const subTotal = Math.round(parseFloat(quantity) * parseFloat(unitPrice) * 100) / 100;

        const orderItem = await db.OrderItem.create({
          order_id,
          substance_id,
          quantity: parseInt(quantity),
          unitPrice: parseFloat(unitPrice),
          subTotal
        });

        const orderItems = await db.OrderItem.findAll({
          where: { order_id }
        });

        const totalCost = orderItems.reduce((sum: number, item: any) => {
          return sum + parseFloat(item.subTotal);
        }, 0);

        await order.update({ totalAmount: Math.round(totalCost * 100) / 100 }); 

        const completeOrderItem = await db.OrderItem.findByPk(orderItem.orderItem_id, {
          include: [
            { model: db.Order, as: 'order' },
            { 
              model: db.Substance, 
              as: 'substance',
              include: [{ 
                model: db.Provider, 
                as: 'provider', 
                attributes: { exclude: ['password'] } 
              }]
            }
          ]
        });

        return res.status(201).json({
          message: 'Order item created successfully',
          orderItem: completeOrderItem
        });
      } catch (error: any) {
        console.error(`Error creating order item (attempt ${attempts + 1}):`, error.message);
        
        if ((error.code === '23505' || error.parent?.code === '23505') && 
            (error.constraint?.includes('_pkey') || error.parent?.constraint?.includes('_pkey'))) {
          attempts++;
          
          try {
            await db.sequelize.query(`SELECT nextval('order_items_orderitem_id_seq')`);
            console.log('Advanced order_items sequence, retrying...');
            continue;
          } catch (seqError) {
            console.error('Error advancing sequence:', seqError);
          }
          
          if (attempts >= maxRetries) {
            return res.status(500).json({ 
              message: `Unable to create order item after ${maxRetries} attempts. Please contact support.`,
              error: 'ID generation failed'
            });
          }
          continue;
        }
        
        return res.status(500).json({ 
          message: 'Error creating order item', 
          error: error.message 
        });
      }
    }
  };

  static getAll = async (req: AuthRequest, res: Response) => {
    try {
      const orderItems = await db.OrderItem.findAll({
        include: [
          { 
            model: db.Order, 
            as: 'order',
            include: [
              { model: db.Customer, as: 'customer', attributes: { exclude: ['password'] } },
              { model: db.Dealer, as: 'dealer', attributes: { exclude: ['password'] } }
            ]
          },
          { 
            model: db.Substance, 
            as: 'substance',
            include: [{ 
              model: db.Provider, 
              as: 'provider', 
              attributes: { exclude: ['password'] } 
            }]
          }
        ]
      });

      return res.status(200).json({ orderItems });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error fetching order items', 
        error: error.message 
      });
    }
  };

  static getById = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const orderItem = await db.OrderItem.findByPk(id, {
        include: [
          { 
            model: db.Order, 
            as: 'order',
            include: [
              { model: db.Customer, as: 'customer', attributes: { exclude: ['password'] } },
              { model: db.Dealer, as: 'dealer', attributes: { exclude: ['password'] } }
            ]
          },
          { 
            model: db.Substance, 
            as: 'substance',
            include: [{ 
              model: db.Provider, 
              as: 'provider', 
              attributes: { exclude: ['password'] } 
            }]
          }
        ]
      });

      if (!orderItem) {
        return res.status(404).json({ message: 'Order item not found' });
      }

      if (req.user?.type === 'customer' && orderItem.order.customer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot access other customers order items' });
      }

      if (req.user?.type === 'dealer' && orderItem.order.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot access other dealers order items' });
      }

      return res.status(200).json({ orderItem });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error fetching order item', 
        error: error.message 
      });
    }
  };

  static getByOrderId = async (req: AuthRequest, res: Response) => {
    try {
      const { orderId } = req.params;

      const order = await db.Order.findByPk(orderId);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (req.user?.type === 'customer' && order.customer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot access other customers order items' });
      }

      if (req.user?.type === 'dealer' && order.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot access other dealers order items' });
      }

      const orderItems = await db.OrderItem.findAll({
        where: { order_id: orderId },
        include: [
          { 
            model: db.Substance, 
            as: 'substance',
            include: [{ 
              model: db.Provider, 
              as: 'provider', 
              attributes: { exclude: ['password'] } 
            }]
          }
        ]
      });

      return res.status(200).json({ orderItems });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error fetching order items', 
        error: error.message 
      });
    }
  };

  static update = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { quantity, unitPrice } = req.body;

      if (quantity && quantity < 1) {
        return res.status(400).json({ 
          message: 'Quantity must be at least 1' 
        });
      }

      const orderItem = await db.OrderItem.findByPk(id, {
        include: [{ model: db.Order, as: 'order' }]
      });

      if (!orderItem) {
        return res.status(404).json({ message: 'Order item not found' });
      }

      if (req.user?.type !== 'customer') {
        return res.status(403).json({ message: 'Only customers can update order items' });
      }

      if (orderItem.order.customer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot update other customers order items' });
      }

      if (orderItem.order.orderStatus !== 'pending') {
        return res.status(400).json({ 
          message: 'Cannot update items in orders that are not pending' 
        });
      }

      const updateData: any = {};
      
      if (quantity) updateData.quantity = parseInt(quantity);
      if (unitPrice) updateData.unitPrice = parseFloat(unitPrice);

      if (quantity || unitPrice) {
        const newQuantity = quantity ? parseInt(quantity) : orderItem.quantity;
        const newUnitPrice = unitPrice ? parseFloat(unitPrice) : parseFloat(orderItem.unitPrice);
        updateData.subTotal = Math.round(newQuantity * newUnitPrice * 100) / 100;
      }

      await orderItem.update(updateData);

      const orderItems = await db.OrderItem.findAll({
        where: { order_id: orderItem.order_id }
      });

      const totalCost = orderItems.reduce((sum: number, item: any) => {
        return sum + parseFloat(item.subTotal);
      }, 0);

      await orderItem.order.update({ totalAmount: Math.round(totalCost * 100) / 100 });  // Changed to totalAmount

      const updatedOrderItem = await db.OrderItem.findByPk(id, {
        include: [
          { model: db.Order, as: 'order' },
          { 
            model: db.Substance, 
            as: 'substance',
            include: [{ 
              model: db.Provider, 
              as: 'provider', 
              attributes: { exclude: ['password'] } 
            }]
          }
        ]
      });

      return res.status(200).json({
        message: 'Order item updated successfully',
        orderItem: updatedOrderItem
      });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error updating order item', 
        error: error.message 
      });
    }
  };

  static delete = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const orderItem = await db.OrderItem.findByPk(id, {
        include: [{ model: db.Order, as: 'order' }]
      });

      if (!orderItem) {
        return res.status(404).json({ message: 'Order item not found' });
      }

      if (req.user?.type !== 'customer') {
        return res.status(403).json({ message: 'Only customers can delete order items' });
      }

      if (orderItem.order.customer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot delete other customers order items' });
      }

      if (orderItem.order.orderStatus !== 'pending') {
        return res.status(400).json({ 
          message: 'Cannot delete items from orders that are not pending' 
        });
      }

      const orderId = orderItem.order_id;
      
      await orderItem.destroy();

      const remainingItems = await db.OrderItem.findAll({
        where: { order_id: orderId }
      });

      if (remainingItems.length > 0) {
        const totalCost = remainingItems.reduce((sum: number, item: any) => {
          return sum + parseFloat(item.subTotal);
        }, 0);

        await db.Order.update(
          { totalAmount: Math.round(totalCost * 100) / 100 },  
          { where: { order_id: orderId } }
        );
      } else {
        await db.Order.update(
          { totalAmount: 0 },  
          { where: { order_id: orderId } }
        );
      }

      return res.status(200).json({ message: 'Order item deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error deleting order item', 
        error: error.message 
      });
    }
  };
}