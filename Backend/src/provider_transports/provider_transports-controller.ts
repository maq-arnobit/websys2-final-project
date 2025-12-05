import { Response } from 'express';
import { AuthRequest } from '../auth/auth-middleware';
const db = require('../../models');

export class ProviderTransportController {
 
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const { provider_id } = req.query;
      const where: any = {};

      if (provider_id) where.provider_id = provider_id;

      const transportOptions = await db.ProviderTransport.findAll({
        where,
        include: [
          {
            model: db.Provider,
            as: 'provider',
            attributes: { exclude: ['password'] }
          }
        ]
      });

      return res.status(200).json({ transportOptions });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching transport options', error: error.message });
    }
  }

  // Get transport option by ID
  static async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const transportOption = await db.ProviderTransport.findByPk(id, {
        include: [
          {
            model: db.Provider,
            as: 'provider',
            attributes: { exclude: ['password'] }
          }
        ]
      });

      if (!transportOption) {
        return res.status(404).json({ message: 'Transport option not found' });
      }

      return res.status(200).json({ transportOption });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching transport option', error: error.message });
    }
  }

  // Create transport option (Provider only)
  static async create(req: AuthRequest, res: Response) {
    try {
      const { transportMethod, transportCost, costPerKG } = req.body;

      if (!req.user || req.user.type !== 'provider') {
        return res.status(403).json({ message: 'Only providers can create transport options' });
      }

      if (!transportMethod || !transportCost || !costPerKG) {
        return res.status(400).json({ message: 'Transport method, cost, and cost per KG are required' });
      }

      const transportOption = await db.ProviderTransport.create({
        provider_id: req.user.id,
        transportMethod,
        transportCost,
        costPerKG
      });

      return res.status(201).json({
        message: 'Transport option created successfully',
        transportOption
      });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error creating transport option', error: error.message });
    }
  }

  // Update transport option 
  static async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { transportMethod, transportCost, costPerKG } = req.body;

      if (!req.user || req.user.type !== 'provider') {
        return res.status(403).json({ message: 'Only providers can update transport options' });
      }

      const transportOption = await db.ProviderTransport.findByPk(id);

      if (!transportOption) {
        return res.status(404).json({ message: 'Transport option not found' });
      }

      if (transportOption.provider_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot update transport options from other providers' });
      }

      const updateData: any = {};
      if (transportMethod) updateData.transportMethod = transportMethod;
      if (transportCost !== undefined) updateData.transportCost = transportCost;
      if (costPerKG !== undefined) updateData.costPerKG = costPerKG;

      await transportOption.update(updateData);

      return res.status(200).json({
        message: 'Transport option updated successfully',
        transportOption
      });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error updating transport option', error: error.message });
    }
  }

  // Delete transport option (Provider only, own options)
  static async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!req.user || req.user.type !== 'provider') {
        return res.status(403).json({ message: 'Only providers can delete transport options' });
      }

      const transportOption = await db.ProviderTransport.findByPk(id);

      if (!transportOption) {
        return res.status(404).json({ message: 'Transport option not found' });
      }

      if (transportOption.provider_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot delete transport options from other providers' });
      }

      await transportOption.destroy();

      return res.status(200).json({ message: 'Transport option deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ message: 'Error deleting transport option', error: error.message });
    }
  }
}