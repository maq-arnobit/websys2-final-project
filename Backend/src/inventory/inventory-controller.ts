import { Response } from 'express';
import { AuthRequest } from '../auth/auth-middleware';
const db = require('../../models');

export class InventoryController {
  // Get inventory 
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const { dealer_id, substance_id } = req.query;
      const where: any = { dealer_id: req.user?.id };  // Ensure the dealer only sees their own inventory

      if (substance_id) where.substance_id = substance_id;

      const inventory = await db.Inventory.findAll({
        where,
        include: [
          {
            model: db.Dealer,
            as: 'dealer',
            attributes: { exclude: ['password'] }
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

      return res.status(200).json({ inventory });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching inventory', error: error.message });
    }
  }

  // Get inventory item by ID
  static async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const inventoryItem = await db.Inventory.findByPk(id, {
        where: { dealer_id: req.user?.id },  // Ensure the dealer can only access their own inventory item
        include: [
          {
            model: db.Dealer,
            as: 'dealer',
            attributes: { exclude: ['password'] }
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

      if (!inventoryItem) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }

      return res.status(200).json({ inventoryItem });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching inventory item', error: error.message });
    }
  }

  // Create inventory item 
  static async create(req: AuthRequest, res: Response) {
    try {
      const { substance_id, quantityAvailable, warehouse } = req.body;

      if (!req.user || req.user.type !== 'dealer') {
        return res.status(403).json({ message: 'Only dealers can create inventory items' });
      }

      if (!substance_id) {
        return res.status(400).json({ message: 'Substance ID is required' });
      }

      // Check if substance exists
      const substance = await db.Substance.findByPk(substance_id);
      if (!substance) {
        return res.status(404).json({ message: 'Substance not found' });
      }

      const inventoryItem = await db.Inventory.create({
        dealer_id: req.user.id,
        substance_id,
        quantityAvailable: quantityAvailable || 0,
        warehouse
      });

      const createdItem = await db.Inventory.findByPk(inventoryItem.inventory_id, {
        include: [
          {
            model: db.Substance,
            as: 'substance'
          }
        ]
      });

      return res.status(201).json({
        message: 'Inventory item created successfully',
        inventoryItem: createdItem
      });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error creating inventory item', error: error.message });
    }
  }

  // Update inventory item
  static async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { quantityAvailable, warehouse } = req.body;

      if (!req.user || req.user.type !== 'dealer') {
        return res.status(403).json({ message: 'Only dealers can update inventory items' });
      }

      const inventoryItem = await db.Inventory.findByPk(id);

      if (!inventoryItem) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }

      if (inventoryItem.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot update inventory from other dealers' });
      }

      const updateData: any = {};
      if (quantityAvailable !== undefined) updateData.quantityAvailable = quantityAvailable;
      if (warehouse) updateData.warehouse = warehouse;

      await inventoryItem.update(updateData);

      return res.status(200).json({
        message: 'Inventory item updated successfully',
        inventoryItem
      });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error updating inventory item', error: error.message });
    }
  }

  // Delete inventory item 
  static async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!req.user || req.user.type !== 'dealer') {
        return res.status(403).json({ message: 'Only dealers can delete inventory items' });
      }

      const inventoryItem = await db.Inventory.findByPk(id);

      if (!inventoryItem) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }

      if (inventoryItem.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot delete inventory from other dealers' });
      }

      await inventoryItem.destroy();

      return res.status(200).json({ message: 'Inventory item deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error deleting inventory item', error: error.message });
    }
  }
}
