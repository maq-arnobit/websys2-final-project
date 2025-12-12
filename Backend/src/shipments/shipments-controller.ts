import { Response } from 'express';
import { AuthRequest } from '../middleware/auth-middleware'; // Check your path '../' or '../../'
const db = require('../../models');

export class ShipmentsController {
  
  static create = async (req: AuthRequest, res: Response) => {
    const maxRetries = 20;
    let attempts = 0;

    // 1. Loop to handle ID sequence errors
    while (attempts < maxRetries) {
      const t = await db.sequelize.transaction();

      try {
        if (!req.user || req.user.type !== 'dealer') {
          await t.rollback();
          return res.status(403).json({ message: 'Only dealers can ship orders' });
        }

        const { order_id, carrier } = req.body;

        // 2. Find the Order
        const order = await db.Order.findByPk(order_id);

        if (!order) {
          await t.rollback();
          return res.status(404).json({ message: 'Order not found' });
        }

        // 3. Security Check
        if (Number(order.dealer_id) !== Number(req.user.id)) {
          await t.rollback();
          return res.status(403).json({ message: 'Unauthorized access to order' });
        }

        if (order.orderStatus === 'shipped' || order.orderStatus === 'delivered') {
          await t.rollback();
          return res.status(400).json({ message: 'Order is already shipped' });
        }

        // 4. Create Shipment
        const shipment = await db.Shipment.create({
          order_id,
          carrier: carrier || 'Standard Courier',
          status: 'in_transit' 
        }, { transaction: t });

        // 5. Update Order Status
        await order.update({ 
          orderStatus: 'shipped' 
        }, { transaction: t });

        await t.commit();

        return res.status(201).json({ 
          message: 'Order shipped successfully',
          shipment 
        });

      } catch (error: any) {
        await t.rollback();

        console.error(`Shipment Error (Attempt ${attempts + 1}):`, error.message);

        // 6. CATCH THE SEQUENCE ERROR AND RETRY
        if ((error.code === '23505' || error.parent?.code === '23505') && 
            (error.constraint?.includes('_pkey') || error.parent?.constraint?.includes('_pkey'))) {
          
          attempts++;
          try {
            // Manually advance the ID counter
            await db.sequelize.query(`SELECT nextval('shipments_shipment_id_seq')`);
            console.log('Advanced shipments sequence, retrying...');
            continue; // Jump back to start of while loop
          } catch (seqError) {
            console.error('Error advancing sequence:', seqError);
          }
        }

        // Real Error
        return res.status(500).json({ 
          message: 'Error processing shipment', 
          error: error.message 
        });
      }
    }
  };
}