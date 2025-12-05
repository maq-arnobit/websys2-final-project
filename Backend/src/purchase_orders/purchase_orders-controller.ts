import { Response } from 'express';
import { AuthRequest } from '../auth/auth-middleware';
const db = require('../../models');

export class PurchaseOrderController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const { dealer_id, provider_id, paymentStatus } = req.query;
      const where: any = {};

      if (dealer_id) where.dealer_id = dealer_id;
      if (provider_id) where.provider_id = provider_id;
      if (paymentStatus !== undefined) where.paymentStatus = paymentStatus === 'true';

      const purchaseOrders = await db.PurchaseOrder.findAll({
        where,
        include: [
          {
            model: db.Dealer,
            as: 'dealer',
            attributes: { exclude: ['password'] }
          },
          {
            model: db.Provider,
            as: 'provider',
            attributes: { exclude: ['password'] }
          },
          {
            model: db.Substance,
            as: 'substance'
          },
          {
            model: db.ProviderTransport,
            as: 'transport'
          }
        ]
      });

      return res.status(200).json({ purchaseOrders });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching purchase orders', error: error.message });
    }
  }

  // Get purchase order by ID
  static async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const purchaseOrder = await db.PurchaseOrder.findByPk(id, {
        include: [
          {
            model: db.Dealer,
            as: 'dealer',
            attributes: { exclude: ['password'] }
          },
          {
            model: db.Provider,
            as: 'provider',
            attributes: { exclude: ['password'] }
          },
          {
            model: db.Substance,
            as: 'substance'
          },
          {
            model: db.ProviderTransport,
            as: 'transport'
          }
        ]
      });

      if (!purchaseOrder) {
        return res.status(404).json({ message: 'Purchase order not found' });
      }

     
      if (req.user?.type === 'dealer' && purchaseOrder.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot view other dealer purchase orders' });
      }

      if (req.user?.type === 'provider' && purchaseOrder.provider_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot view other provider purchase orders' });
      }

      return res.status(200).json({ purchaseOrder });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching purchase order', error: error.message });
    }
  }

  // Create purchase order (Dealer only)
  static async create(req: AuthRequest, res: Response) {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { provider_id, substance_id, providerTransport_id, quantityOrdered, unitCost, paymentMethod } = req.body;

      if (!req.user || req.user.type !== 'dealer') {
        await transaction.rollback();
        return res.status(403).json({ message: 'Only dealers can create purchase orders' });
      }

      if (!provider_id || !substance_id || !quantityOrdered || !unitCost) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Provider, substance, quantity, and unit cost are required' });
      }

   
      const provider = await db.Provider.findByPk(provider_id);
      if (!provider) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Provider not found' });
      }

      const substance = await db.Substance.findByPk(substance_id);
      if (!substance) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Substance not found' });
      }


      let transportCost = 0;
      if (providerTransport_id) {
        const transport = await db.ProviderTransport.findByPk(providerTransport_id);
        if (!transport) {
          await transaction.rollback();
          return res.status(404).json({ message: 'Transport option not found' });
        }
        transportCost = parseFloat(transport.transportCost);
      }

 
      const totalCost = (quantityOrdered * unitCost) + transportCost;

      const purchaseOrder = await db.PurchaseOrder.create({
        dealer_id: req.user.id,
        provider_id,
        substance_id,
        providerTransport_id: providerTransport_id || null,
        quantityOrdered,
        unitCost,
        transportCost,
        totalCost,
        orderDate: new Date(),
        paymentStatus: false,
        paymentMethod: paymentMethod || null
      }, { transaction });

      await transaction.commit();

      const createdPurchaseOrder = await db.PurchaseOrder.findByPk(purchaseOrder.purchaseOrder_id, {
        include: [
          {
            model: db.Provider,
            as: 'provider',
            attributes: { exclude: ['password'] }
          },
          {
            model: db.Substance,
            as: 'substance'
          },
          {
            model: db.ProviderTransport,
            as: 'transport'
          }
        ]
      });

      return res.status(201).json({
        message: 'Purchase order created successfully',
        purchaseOrder: createdPurchaseOrder
      });
    } catch (error: any) {
      await transaction.rollback();
      return res.status(500).json({ message: 'Error creating purchase order', error: error.message });
    }
  }


  static async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { paymentStatus, paymentMethod, paymentDate } = req.body;

      const purchaseOrder = await db.PurchaseOrder.findByPk(id);

      if (!purchaseOrder) {
        return res.status(404).json({ message: 'Purchase order not found' });
      }

    
      if (req.user?.type === 'dealer' && purchaseOrder.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot update other dealer purchase orders' });
      }

      if (req.user?.type === 'provider' && purchaseOrder.provider_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot update other provider purchase orders' });
      }

      const updateData: any = {};
      if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
      if (paymentMethod) updateData.paymentMethod = paymentMethod;
      if (paymentDate) updateData.paymentDate = paymentDate;

      await purchaseOrder.update(updateData);

      
      if (paymentStatus === true && !purchaseOrder.paymentStatus) {
        const inventory = await db.Inventory.findOne({
          where: {
            dealer_id: purchaseOrder.dealer_id,
            substance_id: purchaseOrder.substance_id
          }
        });

        if (inventory) {
          await inventory.update({
            quantityAvailable: inventory.quantityAvailable + purchaseOrder.quantityOrdered
          });
        } else {
          await db.Inventory.create({
            dealer_id: purchaseOrder.dealer_id,
            substance_id: purchaseOrder.substance_id,
            quantityAvailable: purchaseOrder.quantityOrdered
          });
        }
      }

      return res.status(200).json({
        message: 'Purchase order updated successfully',
        purchaseOrder
      });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error updating purchase order', error: error.message });
    }
  }

  
  static async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!req.user || req.user.type !== 'dealer') {
        return res.status(403).json({ message: 'Only dealers can delete purchase orders' });
      }

      const purchaseOrder = await db.PurchaseOrder.findByPk(id);

      if (!purchaseOrder) {
        return res.status(404).json({ message: 'Purchase order not found' });
      }

      if (purchaseOrder.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot delete other dealer purchase orders' });
      }

      if (purchaseOrder.paymentStatus) {
        return res.status(400).json({ message: 'Cannot delete paid purchase orders' });
      }

      await purchaseOrder.destroy();

      return res.status(200).json({ message: 'Purchase order deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error deleting purchase order', error: error.message });
    }
  }
}