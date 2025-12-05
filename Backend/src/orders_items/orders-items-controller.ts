import { Response } from 'express';
import { AuthRequest } from '../auth/auth-middleware';
const db = require('../../models');

export class OrderItemController {
 
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const { order_id, substance_id } = req.query;
      const where: any = {};

      if (order_id) where.order_id = order_id;
      if (substance_id) where.substance_id = substance_id;

      const orderItems = await db.OrderItem.findAll({
        where,
        include: [
          {
            model: db.Order,
            as: 'order',
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
              }
            ]
          },
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

      return res.status(200).json({ orderItems });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching order items', error: error.message });
    }
  }

  // Get order item by ID
  static async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const orderItem = await db.OrderItem.findByPk(id, {
        include: [
          {
            model: db.Order,
            as: 'order',
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
              }
            ]
          },
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

      if (!orderItem) {
        return res.status(404).json({ message: 'Order item not found' });
      }

      // Check access permissions
      if (req.user?.type === 'customer' && orderItem.order.customer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot view other customer order items' });
      }

      if (req.user?.type === 'dealer' && orderItem.order.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot view other dealer order items' });
      }

      return res.status(200).json({ orderItem });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching order item', error: error.message });
    }
  }

  // Get order items by order ID
  static async getByOrderId(req: AuthRequest, res: Response) {
    try {
      const { orderId } = req.params;

      const order = await db.Order.findByPk(orderId);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      
      if (req.user?.type === 'customer' && order.customer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot view other customer order items' });
      }

      if (req.user?.type === 'dealer' && order.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot view other dealer order items' });
      }

      const orderItems = await db.OrderItem.findAll({
        where: { order_id: orderId },
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

      return res.status(200).json({ orderItems });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching order items', error: error.message });
    }
  }

  // Create order item 
  static async create(req: AuthRequest, res: Response) {
    try {
      const { order_id, substance_id, quantity, unitPrice } = req.body;

      if (!req.user || req.user.type !== 'customer') {
        return res.status(403).json({ message: 'Only customers can create order items' });
      }

      if (!order_id || !substance_id || !quantity || !unitPrice) {
        return res.status(400).json({ message: 'Order ID, substance ID, quantity, and unit price are required' });
      }

      
      const order = await db.Order.findByPk(order_id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (order.customer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot add items to other customer orders' });
      }

      if (order.orderStatus !== 'pending') {
        return res.status(400).json({ message: 'Cannot add items to non-pending orders' });
      }

      
      const substance = await db.Substance.findByPk(substance_id);
      if (!substance) {
        return res.status(404).json({ message: 'Substance not found' });
      }

   
      const inventory = await db.Inventory.findOne({
        where: {
          dealer_id: order.dealer_id,
          substance_id: substance_id
        }
      });

      if (!inventory || inventory.quantityAvailable < quantity) {
        return res.status(400).json({ message: 'Insufficient inventory for this substance' });
      }

      const subTotal = quantity * unitPrice;

      
      const orderItem = await db.OrderItem.create({
        order_id,
        substance_id,
        quantity,
        unitPrice,
        subTotal
      });

     
      await inventory.update({
        quantityAvailable: inventory.quantityAvailable - quantity
      });

     
      const currentTotal = parseFloat(order.totalAmount);
      await order.update({
        totalAmount: currentTotal + subTotal
      });

      const createdOrderItem = await db.OrderItem.findByPk(orderItem.orderItem_id, {
        include: [
          {
            model: db.Substance,
            as: 'substance'
          }
        ]
      });

      return res.status(201).json({
        message: 'Order item created successfully',
        orderItem: createdOrderItem
      });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error creating order item', error: error.message });
    }
  }


  static async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { quantity, unitPrice } = req.body;

      if (!req.user || req.user.type !== 'customer') {
        return res.status(403).json({ message: 'Only customers can update order items' });
      }

      const orderItem = await db.OrderItem.findByPk(id, {
        include: [
          {
            model: db.Order,
            as: 'order'
          }
        ]
      });

      if (!orderItem) {
        return res.status(404).json({ message: 'Order item not found' });
      }

      if (orderItem.order.customer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot update other customer order items' });
      }

      if (orderItem.order.orderStatus !== 'pending') {
        return res.status(400).json({ message: 'Cannot update items in non-pending orders' });
      }

      const oldSubTotal = parseFloat(orderItem.subTotal);
      

      const updateData: any = {};
      let newQuantity = orderItem.quantity;
      let newUnitPrice = parseFloat(orderItem.unitPrice);

      if (quantity !== undefined) {
        newQuantity = quantity;
        updateData.quantity = quantity;

    
        const quantityDiff = quantity - orderItem.quantity;
        const inventory = await db.Inventory.findOne({
          where: {
            dealer_id: orderItem.order.dealer_id,
            substance_id: orderItem.substance_id
          }
        });

        if (inventory) {
          if (quantityDiff > 0 && inventory.quantityAvailable < quantityDiff) {
            return res.status(400).json({ message: 'Insufficient inventory for quantity increase' });
          }
          await inventory.update({
            quantityAvailable: inventory.quantityAvailable - quantityDiff
          });
        }
      }

      if (unitPrice !== undefined) {
        newUnitPrice = unitPrice;
        updateData.unitPrice = unitPrice;
      }

      
      const newSubTotal = newQuantity * newUnitPrice;
      updateData.subTotal = newSubTotal;

      await orderItem.update(updateData);

     
      const currentOrderTotal = parseFloat(orderItem.order.totalAmount);
      const newOrderTotal = currentOrderTotal - oldSubTotal + newSubTotal;
      await orderItem.order.update({ totalAmount: newOrderTotal });

      return res.status(200).json({
        message: 'Order item updated successfully',
        orderItem
      });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error updating order item', error: error.message });
    }
  }

  // Delete order item
  static async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!req.user || req.user.type !== 'customer') {
        return res.status(403).json({ message: 'Only customers can delete order items' });
      }

      const orderItem = await db.OrderItem.findByPk(id, {
        include: [
          {
            model: db.Order,
            as: 'order'
          }
        ]
      });

      if (!orderItem) {
        return res.status(404).json({ message: 'Order item not found' });
      }

      if (orderItem.order.customer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot delete other customer order items' });
      }

      if (orderItem.order.orderStatus !== 'pending') {
        return res.status(400).json({ message: 'Cannot delete items from non-pending orders' });
      }

      
      const inventory = await db.Inventory.findOne({
        where: {
          dealer_id: orderItem.order.dealer_id,
          substance_id: orderItem.substance_id
        }
      });

      if (inventory) {
        await inventory.update({
          quantityAvailable: inventory.quantityAvailable + orderItem.quantity
        });
      }

     
      const currentTotal = parseFloat(orderItem.order.totalAmount);
      const itemSubTotal = parseFloat(orderItem.subTotal);
      await orderItem.order.update({
        totalAmount: currentTotal - itemSubTotal
      });

      await orderItem.destroy();

      return res.status(200).json({ message: 'Order item deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error deleting order item', error: error.message });
    }
  }
}