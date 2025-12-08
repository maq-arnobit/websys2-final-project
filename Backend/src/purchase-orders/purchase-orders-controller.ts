import { Response } from 'express';
import { AuthRequest } from '../middleware/auth-middleware';
const db = require('../../models');

export class PurchaseOrdersController {
    static create = async (req: AuthRequest, res: Response) => {
    const maxRetries = 20;
    let attempts = 0;

    while (attempts < maxRetries) {
        try {
        if (!req.user || req.user.type !== 'dealer') {
            return res.status(403).json({ message: 'Only dealers can create purchase orders' });
        }

        const { provider_id, substance_id, providerTransport_id, quantityOrdered, unitCost, paymentMethod } = req.body;
       
        if (attempts === 0) {
            if (!provider_id || !substance_id || !providerTransport_id || !quantityOrdered || !unitCost || !paymentMethod) {
            return res.status(400).json({ 
                message: 'Missing required fields: provider_id, substance_id, providerTransport_id, quantityOrdered, unitCost, paymentMethod' 
            });
            }
        }

        const transport = await db.ProviderTransport.findByPk(providerTransport_id);
        
        if (!transport) {
            return res.status(404).json({ message: 'Transport option not found' });
        }

        if (transport.provider_id !== provider_id) {
            return res.status(400).json({ 
                message: 'Transport option does not belong to the specified provider' 
            });
        }

        const parsedQuantity = parseFloat(quantityOrdered);
        const parsedUnitCost = parseFloat(unitCost);
        
        const subtotal = parsedQuantity * parsedUnitCost;
        const transportCost = parseFloat(transport.transportCost);
        const totalCost = Math.round((subtotal + transportCost) * 100) / 100;

        const purchaseOrder = await db.PurchaseOrder.create({
            dealer_id: req.user.id,
            provider_id,
            substance_id,
            providerTransport_id,
            quantityOrdered: parsedQuantity,
            unitCost: parsedUnitCost,
            transportCost: transportCost,  
            totalCost,
            paymentMethod,
            paymentDate: new Date(),
            status: 'pending'
        });

        const completePurchaseOrder = await db.PurchaseOrder.findByPk(purchaseOrder.purchaseOrder_id, {
            include: [
            { model: db.Dealer, as: 'dealer', attributes: { exclude: ['password'] } },
            { model: db.Provider, as: 'provider', attributes: { exclude: ['password'] } },
            { model: db.Substance, as: 'substance' },
            { model: db.ProviderTransport, as: 'transport' }
            ]
        });

        return res.status(201).json({
            message: 'Purchase order created successfully',
            purchaseOrder: completePurchaseOrder
        });
        } catch (error: any) {
        console.error(`Error creating purchase order (attempt ${attempts + 1}):`, error.message);
        
        if ((error.code === '23505' || error.parent?.code === '23505') && 
            (error.constraint?.includes('_pkey') || error.parent?.constraint?.includes('_pkey'))) {
            attempts++;
            
            try {
            await db.sequelize.query(`SELECT nextval('purchase_orders_purchaseorder_id_seq')`);
            console.log('Advanced purchase_orders sequence, retrying...');
            continue;
            } catch (seqError) {
            console.error('Error advancing sequence:', seqError);
            }
            
            if (attempts >= maxRetries) {
            return res.status(500).json({ 
                message: `Unable to create purchase order after ${maxRetries} attempts. Please contact support.`,
                error: 'ID generation failed'
            });
            }
            continue;
        }
        
        return res.status(500).json({ 
            message: 'Error creating purchase order', 
            error: error.message 
        });
        }
    }
    };
  static getAll = async (req: AuthRequest, res: Response) => {
    try {
      const purchaseOrders = await db.PurchaseOrder.findAll({
        include: [
          { model: db.Dealer, as: 'dealer', attributes: { exclude: ['password'] } },
          { model: db.Provider, as: 'provider', attributes: { exclude: ['password'] } },
          { model: db.Substance, as: 'substance' },
          { model: db.ProviderTransport, as: 'transport' }
        ]
      });

      return res.status(200).json({ purchaseOrders });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error fetching purchase orders', 
        error: error.message 
      });
    }
  };

  static getById = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const purchaseOrder = await db.PurchaseOrder.findByPk(id, {
        include: [
          { model: db.Dealer, as: 'dealer', attributes: { exclude: ['password'] } },
          { model: db.Provider, as: 'provider', attributes: { exclude: ['password'] } },
          { model: db.Substance, as: 'substance' },
          { model: db.ProviderTransport, as: 'transport' }
        ]
      });

      if (!purchaseOrder) {
        return res.status(404).json({ message: 'Purchase order not found' });
      }

      return res.status(200).json({ purchaseOrder });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error fetching purchase order', 
        error: error.message 
      });
    }
  };

  static update = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const purchaseOrder = await db.PurchaseOrder.findByPk(id);

      if (!purchaseOrder) {
        return res.status(404).json({ message: 'Purchase order not found' });
      }

      if (req.user?.type === 'dealer' && purchaseOrder.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot update other dealers purchase orders' });
      }

      if (req.user?.type === 'provider' && purchaseOrder.provider_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot update purchase orders for other providers' });
      }

      await purchaseOrder.update(req.body);

      return res.status(200).json({
        message: 'Purchase order updated successfully',
        purchaseOrder
      });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error updating purchase order', 
        error: error.message 
      });
    }
  };

  static delete = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const purchaseOrder = await db.PurchaseOrder.findByPk(id);

      if (!purchaseOrder) {
        return res.status(404).json({ message: 'Purchase order not found' });
      }

      if (req.user?.type === 'dealer' && purchaseOrder.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot delete other dealers purchase orders' });
      }

      await purchaseOrder.destroy();

      return res.status(200).json({ message: 'Purchase order deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error deleting purchase order', 
        error: error.message 
      });
    }
  };
}