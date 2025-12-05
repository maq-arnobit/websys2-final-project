import { Response } from 'express';
import { AuthRequest } from '../auth/auth-middleware';
const db = require('../../models');

export class ShipmentController {

  static async getAll(req: AuthRequest, res: Response) {
    try {
      const { status } = req.query;
      const where: any = {};

      if (status) where.status = status;

      const shipments = await db.Shipment.findAll({
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
          }
        ]
      });

      return res.status(200).json({ shipments });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching shipments', error: error.message });
    }
  }


  static async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const shipment = await db.Shipment.findByPk(id, {
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
              }
            ]
          }
        ]
      });

      if (!shipment) {
        return res.status(404).json({ message: 'Shipment not found' });
      }


      if (req.user?.type === 'customer' && shipment.order.customer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot view other customer shipments' });
      }

      if (req.user?.type === 'dealer' && shipment.order.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot view other dealer shipments' });
      }

      return res.status(200).json({ shipment });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching shipment', error: error.message });
    }
  }


  static async create(req: AuthRequest, res: Response) {
    try {
      const { order_id, carrier } = req.body;

      if (!req.user || req.user.type !== 'dealer') {
        return res.status(403).json({ message: 'Only dealers can create shipments' });
      }

      if (!order_id) {
        return res.status(400).json({ message: 'Order ID is required' });
      }

     
      const order = await db.Order.findByPk(order_id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (order.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot create shipment for other dealer orders' });
      }

   
      const existingShipment = await db.Shipment.findOne({ where: { order_id } });
      if (existingShipment) {
        return res.status(400).json({ message: 'Shipment already exists for this order' });
      }

      const shipment = await db.Shipment.create({
        order_id,
        carrier: carrier || '',
        status: 'preparing'
      });

 
      await order.update({ orderStatus: 'processing' });

      return res.status(201).json({
        message: 'Shipment created successfully',
        shipment
      });
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Shipment already exists for this order' });
      }
      return res.status(500).json({ message: 'Error creating shipment', error: error.message });
    }
  }

  // Update shipment 
  static async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { carrier, status } = req.body;

      if (!req.user || req.user.type !== 'dealer') {
        return res.status(403).json({ message: 'Only dealers can update shipments' });
      }

      const shipment = await db.Shipment.findByPk(id, {
        include: [
          {
            model: db.Order,
            as: 'order'
          }
        ]
      });

      if (!shipment) {
        return res.status(404).json({ message: 'Shipment not found' });
      }

      if (shipment.order.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot update shipments for other dealer orders' });
      }

      const updateData: any = {};
      if (carrier) updateData.carrier = carrier;
      if (status) updateData.status = status;

      await shipment.update(updateData);

     
      if (status === 'in_transit') {
        await shipment.order.update({ orderStatus: 'shipped' });
      } else if (status === 'delivered') {
        await shipment.order.update({ orderStatus: 'delivered' });
      } else if (status === 'failed') {
        await shipment.order.update({ orderStatus: 'cancelled' });
      }

      return res.status(200).json({
        message: 'Shipment updated successfully',
        shipment
      });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error updating shipment', error: error.message });
    }
  }

  // Delete shipment
  static async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!req.user || req.user.type !== 'dealer') {
        return res.status(403).json({ message: 'Only dealers can delete shipments' });
      }

      const shipment = await db.Shipment.findByPk(id, {
        include: [
          {
            model: db.Order,
            as: 'order'
          }
        ]
      });

      if (!shipment) {
        return res.status(404).json({ message: 'Shipment not found' });
      }

      if (shipment.order.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot delete shipments for other dealer orders' });
      }

      if (shipment.status === 'in_transit' || shipment.status === 'delivered') {
        return res.status(400).json({ message: 'Cannot delete shipment that is in transit or delivered' });
      }

      await shipment.destroy();

      return res.status(200).json({ message: 'Shipment deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error deleting shipment', error: error.message });
    }
  }

  // Get shipment by order ID
  static async getByOrderId(req: AuthRequest, res: Response) {
    try {
      const { orderId } = req.params;

      const shipment = await db.Shipment.findOne({
        where: { order_id: orderId },
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
          }
        ]
      });

      if (!shipment) {
        return res.status(404).json({ message: 'Shipment not found for this order' });
      }

      if (req.user?.type === 'customer' && shipment.order.customer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot view other customer shipments' });
      }

      if (req.user?.type === 'dealer' && shipment.order.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot view other dealer shipments' });
      }

      return res.status(200).json({ shipment });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching shipment', error: error.message });
    }
  }
}