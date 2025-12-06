import { Response } from 'express';
import { AuthRequest } from '../middleware/auth-middleware';
const db = require('../../models');

export class InventoryController {
  static create = async (req: AuthRequest, res: Response) => {
    const maxRetries = 20;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        if (!req.user || req.user.type !== 'dealer') {
          return res.status(403).json({ message: 'Only dealers can create inventory items' });
        }

        const { substance_id, quantity, reorderLevel } = req.body;

        if (attempts === 0) {
          if (!substance_id || quantity === undefined) {
            return res.status(400).json({ 
              message: 'Missing required fields: substance_id, quantity' 
            });
          }
        }

        const existingInventory = await db.Inventory.findOne({
          where: {
            dealer_id: req.user.id,
            substance_id
          }
        });

        if (existingInventory) {
          return res.status(400).json({ 
            message: 'Inventory item already exists for this substance. Use update instead.' 
          });
        }

        const inventory = await db.Inventory.create({
          dealer_id: req.user.id,
          substance_id,
          quantity,
          reorderLevel: reorderLevel || 0
        });

        const inventoryWithDetails = await db.Inventory.findByPk(inventory.inventory_id, {
          include: [{
            model: db.Substance,
            as: 'substance',
            include: [{ 
              model: db.Provider, 
              as: 'provider', 
              attributes: { exclude: ['password'] } 
            }]
          }]
        });

        return res.status(201).json({
          message: 'Inventory item created successfully',
          inventory: inventoryWithDetails
        });
      } catch (error: any) {
        console.error(`Error creating inventory (attempt ${attempts + 1}):`, error.message);
        
        if ((error.code === '23505' || error.parent?.code === '23505') && 
            (error.constraint?.includes('_pkey') || error.parent?.constraint?.includes('_pkey'))) {
          attempts++;
          
          try {
            await db.sequelize.query(`SELECT nextval('inventories_inventory_id_seq')`);
            console.log('Advanced inventories sequence, retrying...');
            continue;
          } catch (seqError) {
            console.error('Error advancing sequence:', seqError);
          }
          
          if (attempts >= maxRetries) {
            return res.status(500).json({ 
              message: `Unable to create inventory after ${maxRetries} attempts. Please contact support.`,
              error: 'ID generation failed'
            });
          }
          continue;
        }
        
        return res.status(500).json({ 
          message: 'Error creating inventory item', 
          error: error.message 
        });
      }
    }
  };

  static getAll = async (req: AuthRequest, res: Response) => {
    try {
      const inventory = await db.Inventory.findAll({
        include: [{
          model: db.Substance,
          as: 'substance',
          include: [{ 
            model: db.Provider, 
            as: 'provider', 
            attributes: { exclude: ['password'] } 
          }]
        },
        {
          model: db.Dealer,
          as: 'dealer',
          attributes: { exclude: ['password'] }
        }]
      });

      return res.status(200).json({ inventory });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error fetching inventory', 
        error: error.message 
      });
    }
  };

  static getById = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const inventory = await db.Inventory.findByPk(id, {
        include: [{
          model: db.Substance,
          as: 'substance',
          include: [{ 
            model: db.Provider, 
            as: 'provider', 
            attributes: { exclude: ['password'] } 
          }]
        },
        {
          model: db.Dealer,
          as: 'dealer',
          attributes: { exclude: ['password'] }
        }]
      });

      if (!inventory) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }

      return res.status(200).json({ inventory });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error fetching inventory item', 
        error: error.message 
      });
    }
  };

  static update = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const inventory = await db.Inventory.findByPk(id);

      if (!inventory) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }

      if (req.user?.type === 'dealer' && inventory.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot update other dealers inventory' });
      }

      await inventory.update(req.body);

      const updatedInventory = await db.Inventory.findByPk(id, {
        include: [{
          model: db.Substance,
          as: 'substance',
          include: [{ 
            model: db.Provider, 
            as: 'provider', 
            attributes: { exclude: ['password'] } 
          }]
        }]
      });

      return res.status(200).json({
        message: 'Inventory item updated successfully',
        inventory: updatedInventory
      });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error updating inventory item', 
        error: error.message 
      });
    }
  };

  static delete = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const inventory = await db.Inventory.findByPk(id);

      if (!inventory) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }

      if (req.user?.type === 'dealer' && inventory.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot delete other dealers inventory' });
      }

      await inventory.destroy();

      return res.status(200).json({ message: 'Inventory item deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error deleting inventory item', 
        error: error.message 
      });
    }
  };
}