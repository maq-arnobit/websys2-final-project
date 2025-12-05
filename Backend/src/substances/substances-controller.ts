import { Response } from 'express';
import { AuthRequest } from '../auth/auth-middleware';
const db = require('../../models');

export class SubstanceController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const substances = await db.Substance.findAll({
        include: [
          {
            model: db.Provider,
            as: 'provider',
            attributes: { exclude: ['password'] }
          }
        ]
      });
      return res.status(200).json({ substances });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching substances', error: error.message });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const substance = await db.Substance.findByPk(id, {
        include: [
          {
            model: db.Provider,
            as: 'provider',
            attributes: { exclude: ['password'] }
          }
        ]
      });

      if (!substance) {
        return res.status(404).json({ message: 'Substance not found' });
      }

      return res.status(200).json({ substance });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching substance', error: error.message });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const { substanceName, category, description } = req.body;

      if (!substanceName) {
        return res.status(400).json({ message: 'Substance name is required' });
      }

      if (req.user?.type === 'provider') {
 
        const substance = await db.Substance.create({
          provider_id: req.user.id,
          substanceName,
          category,
          description
        });

        return res.status(201).json({
          message: 'Substance created successfully by provider',
          substance
        });
      } else if (req.user?.type === 'dealer') {
        const substance = await db.Substance.create({
          provider_id: req.user.id,  
          substanceName,
          category,
          description
        });

       
        await db.Inventory.create({
          dealer_id: req.user.id,
          substance_id: substance.id,
          quantityAvailable: 0, 
          warehouse: 'Default Warehouse'
        });

        return res.status(201).json({
          message: 'Substance created and added to dealer inventory',
          substance
        });
      } else {
        return res.status(403).json({ message: 'Only dealers or providers can create substances' });
      }
    } catch (error: any) {
      return res.status(500).json({ message: 'Error creating substance', error: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { substanceName, category, description } = req.body;

      if (!req.user) {
        return res.status(403).json({ message: 'User is not authorized' });
      }

      const substance = await db.Substance.findByPk(id);

      if (!substance) {
        return res.status(404).json({ message: 'Substance not found' });
      }

   
      if (substance.provider_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot update substances from other providers or dealers' });
      }

      const updateData: any = {};
      if (substanceName) updateData.substanceName = substanceName;
      if (category) updateData.category = category;
      if (description !== undefined) updateData.description = description;

      await substance.update(updateData);

      return res.status(200).json({
        message: 'Substance updated successfully',
        substance
      });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error updating substance', error: error.message });
    }
  }


  static async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!req.user) {
        return res.status(403).json({ message: 'User is not authorized' });
      }

      const substance = await db.Substance.findByPk(id);

      if (!substance) {
        return res.status(404).json({ message: 'Substance not found' });
      }

  
      if (substance.provider_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot delete substances from other providers or dealers' });
      }

      await substance.destroy();

      return res.status(200).json({ message: 'Substance deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error deleting substance', error: error.message });
    }
  }
}
