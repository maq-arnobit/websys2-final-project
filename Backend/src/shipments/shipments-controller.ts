import { Response } from 'express';
import { AuthRequest } from '../middleware/auth-middleware';
const db = require('../../models');

export class ShipmentsController {
  static create = async (req: AuthRequest, res: Response) => {
    const maxRetries = 20;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        if (!req.user || req.user.type !== 'dealer') {
          return res.status(403).json({ message: 'Only dealers can create shipments' });
        }

        const { order_id, carrier, status } = req.body;

        if (attempts === 0) {
          if (!order_id || !carrier) {
            return res.status(400).json({ 
              message: 'Missing required fields: order_id, carrier' 
            });
          }

          if (status && !['preparing', 'in_transit', 'delivered', 'failed'].includes(status)) {
            return res.status(400).json({ 
              message: 'Invalid status. Must be: preparing, in_transit, delivered, or failed' 
            });
          }
        }

        const order = await db.Order.findByPk(order_id);
        
        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }

        if (order.dealer_id !== req.user.id) {
          return res.status(403).json({ message: 'Cannot create shipment for other dealers orders' });
        }

        const existingShipment = await db.Shipment.findOne({
          where: { order_id }
        });

        if (existingShipment) {
          return res.status(400).json({ 
            message: 'Shipment already exists for this order. Use update instead.' 
          });
        }

        const shipmentData: any = {
          order_id,
          carrier
        };

        if (status) {
          shipmentData.status = status;
        }

        const shipment = await db.Shipment.create(shipmentData);

        const shipmentStatus = shipment.status;
        let orderStatus = 'processing';
        
        if (shipmentStatus === 'in_transit') {
          orderStatus = 'shipped';
        } else if (shipmentStatus === 'delivered') {
          orderStatus = 'delivered';
        } else if (shipmentStatus === 'failed') {
          orderStatus = 'cancelled';
        }

        await order.update({ orderStatus: orderStatus });

        const completeShipment = await db.Shipment.findByPk(shipment.shipment_id, {
          include: [{
            model: db.Order,
            as: 'order',
            include: [
              { model: db.Customer, as: 'customer', attributes: { exclude: ['password'] } },
              { model: db.Dealer, as: 'dealer', attributes: { exclude: ['password'] } },
              {
                model: db.OrderItem,
                as: 'items',
                include: [{ model: db.Substance, as: 'substance' }]
              }
            ]
          }]
        });

        return res.status(201).json({
          message: 'Shipment created successfully',
          shipment: completeShipment
        });
      } catch (error: any) {
        console.error(`Error creating shipment (attempt ${attempts + 1}):`, error.message);
        
        if ((error.code === '23505' || error.parent?.code === '23505') && 
            (error.constraint?.includes('_pkey') || error.parent?.constraint?.includes('_pkey'))) {
          attempts++;
          
          try {
            await db.sequelize.query(`SELECT nextval('shipments_shipment_id_seq')`);
            console.log('Advanced shipments sequence, retrying...');
            continue;
          } catch (seqError) {
            console.error('Error advancing sequence:', seqError);
          }
          
          if (attempts >= maxRetries) {
            return res.status(500).json({ 
              message: `Unable to create shipment after ${maxRetries} attempts. Please contact support.`,
              error: 'ID generation failed'
            });
          }
          continue;
        }

        if (error.name === 'SequelizeUniqueConstraintError' && error.fields?.order_id) {
          return res.status(400).json({ 
            message: 'Shipment already exists for this order' 
          });
        }
        
        return res.status(500).json({ 
          message: 'Error creating shipment', 
          error: error.message 
        });
      }
    }
  };

  static getAll = async (req: AuthRequest, res: Response) => {
    try {
      const shipments = await db.Shipment.findAll({
        include: [{
          model: db.Order,
          as: 'order',
          include: [
            { model: db.Customer, as: 'customer', attributes: { exclude: ['password'] } },
            { model: db.Dealer, as: 'dealer', attributes: { exclude: ['password'] } },
            {
              model: db.OrderItem,
              as: 'items',
              include: [{ model: db.Substance, as: 'substance' }]
            }
          ]
        }]
      });

      return res.status(200).json({ shipments });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error fetching shipments', 
        error: error.message 
      });
    }
  };

  static getById = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const shipment = await db.Shipment.findByPk(id, {
        include: [{
          model: db.Order,
          as: 'order',
          include: [
            { model: db.Customer, as: 'customer', attributes: { exclude: ['password'] } },
            { model: db.Dealer, as: 'dealer', attributes: { exclude: ['password'] } },
            {
              model: db.OrderItem,
              as: 'items',
              include: [{ model: db.Substance, as: 'substance' }]
            }
          ]
        }]
      });

      if (!shipment) {
        return res.status(404).json({ message: 'Shipment not found' });
      }

      if (req.user?.type === 'customer' && shipment.order.customer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot access other customers shipments' });
      }

      if (req.user?.type === 'dealer' && shipment.order.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot access other dealers shipments' });
      }

      return res.status(200).json({ shipment });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error fetching shipment', 
        error: error.message 
      });
    }
  };

  static getByOrderId = async (req: AuthRequest, res: Response) => {
    try {
      const { orderId } = req.params;

      const shipment = await db.Shipment.findOne({
        where: { order_id: orderId },
        include: [{
          model: db.Order,
          as: 'order',
          include: [
            { model: db.Customer, as: 'customer', attributes: { exclude: ['password'] } },
            { model: db.Dealer, as: 'dealer', attributes: { exclude: ['password'] } },
            {
              model: db.OrderItem,
              as: 'items',
              include: [{ model: db.Substance, as: 'substance' }]
            }
          ]
        }]
      });

      if (!shipment) {
        return res.status(404).json({ message: 'Shipment not found for this order' });
      }

      if (req.user?.type === 'customer' && shipment.order.customer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot access other customers shipments' });
      }

      if (req.user?.type === 'dealer' && shipment.order.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot access other dealers shipments' });
      }

      return res.status(200).json({ shipment });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error fetching shipment', 
        error: error.message 
      });
    }
  };

  static update = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { carrier, status } = req.body;

      if (status && !['preparing', 'in_transit', 'delivered', 'failed'].includes(status)) {
        return res.status(400).json({ 
          message: 'Invalid status. Must be: preparing, in_transit, delivered, or failed' 
        });
      }

      const shipment = await db.Shipment.findByPk(id, {
        include: [{ model: db.Order, as: 'order' }]
      });

      if (!shipment) {
        return res.status(404).json({ message: 'Shipment not found' });
      }

      if (req.user?.type !== 'dealer') {
        return res.status(403).json({ message: 'Only dealers can update shipments' });
      }

      if (shipment.order.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot update other dealers shipments' });
      }

      const updateData: any = {};
      if (carrier) updateData.carrier = carrier;
      if (status) updateData.status = status;

      await shipment.update(updateData);

      if (status) {
        let orderStatus = 'processing'; 
        
        if (status === 'in_transit') {
          orderStatus = 'shipped';
        } else if (status === 'delivered') {
          orderStatus = 'delivered';
        } else if (status === 'failed') {
          orderStatus = 'cancelled';
        } else if (status === 'preparing') {
          orderStatus = 'processing';
        }

        const orderIdToUpdate = shipment.order_id || shipment.dataValues?.order_id;
        console.log(`Attempting to update order ${orderIdToUpdate} to status: ${orderStatus}`);

        const [updateCount] = await db.Order.update(
          { orderStatus: orderStatus },
          { where: { order_id: orderIdToUpdate } }
        );
        
        console.log(`Updated ${updateCount} order(s). Order ${orderIdToUpdate} orderStatus changed to: ${orderStatus}`);
      }

      const updatedShipment = await db.Shipment.findByPk(id, {
        include: [{
          model: db.Order,
          as: 'order',
          include: [
            { model: db.Customer, as: 'customer', attributes: { exclude: ['password'] } },
            { model: db.Dealer, as: 'dealer', attributes: { exclude: ['password'] } },
            {
              model: db.OrderItem,
              as: 'items',
              include: [{ model: db.Substance, as: 'substance' }]
            }
          ]
        }]
      });

      return res.status(200).json({
        message: 'Shipment updated successfully',
        shipment: updatedShipment
      });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error updating shipment', 
        error: error.message 
      });
    }
  };

  static delete = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const shipment = await db.Shipment.findByPk(id, {
        include: [{ model: db.Order, as: 'order' }]
      });

      if (!shipment) {
        return res.status(404).json({ message: 'Shipment not found' });
      }

      if (req.user?.type !== 'dealer') {
        return res.status(403).json({ message: 'Only dealers can delete shipments' });
      }

      if (shipment.order.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot delete other dealers shipments' });
      }

      if (shipment.status === 'delivered') {
        return res.status(400).json({ message: 'Cannot delete delivered shipments' });
      }

      await shipment.order.update({ orderStatus: 'processing' });

      await shipment.destroy();

      return res.status(200).json({ message: 'Shipment deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error deleting shipment', 
        error: error.message 
      });
    }
  };
}