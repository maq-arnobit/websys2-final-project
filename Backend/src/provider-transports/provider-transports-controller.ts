import { Response } from 'express';
import { AuthRequest } from '../middleware/auth-middleware';
const db = require('../../models');

export class ProviderTransportsController {
  static create = async (req: AuthRequest, res: Response) => {
    const maxRetries = 20;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        if (!req.user || req.user.type !== 'provider') {
          return res.status(403).json({ message: 'Only providers can create transport options' });
        }

        const { transportMethod, transportCost, costPerKG } = req.body;

        if (attempts === 0) {
          if (!transportMethod || !transportCost || !costPerKG) {
            return res.status(400).json({ 
              message: 'Missing required fields: transportMethod, transportCost, costPerKG' 
            });
          }
        }

        const transport = await db.ProviderTransport.create({
          provider_id: req.user.id,
          transportMethod,
          transportCost,
          costPerKG
        });

        return res.status(201).json({
          message: 'Transport option created successfully',
          transport
        });
      } catch (error: any) {
        console.error(`Error creating transport (attempt ${attempts + 1}):`, error.message);
        
        if ((error.code === '23505' || error.parent?.code === '23505') && 
            (error.constraint?.includes('_pkey') || error.parent?.constraint?.includes('_pkey'))) {
          attempts++;
          
          try {
            await db.sequelize.query(`SELECT nextval('provider_transports_transport_id_seq')`);
            console.log('Advanced provider_transports sequence, retrying...');
            continue;
          } catch (seqError) {
            console.error('Error advancing sequence:', seqError);
          }
          
          if (attempts >= maxRetries) {
            return res.status(500).json({ 
              message: `Unable to create transport after ${maxRetries} attempts. Please contact support.`,
              error: 'ID generation failed'
            });
          }
          continue;
        }
        
        return res.status(500).json({ 
          message: 'Error creating transport option', 
          error: error.message 
        });
      }
    }
  };

  static update = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const transport = await db.ProviderTransport.findByPk(id);

      if (!transport) {
        return res.status(404).json({ message: 'Transport option not found' });
      }

      if (req.user?.type === 'provider' && transport.provider_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot update other providers transport options' });
      }

      await transport.update(req.body);

      return res.status(200).json({
        message: 'Transport option updated successfully',
        transport
      });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error updating transport option', 
        error: error.message 
      });
    }
  };

  static delete = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const transport = await db.ProviderTransport.findByPk(id);

      if (!transport) {
        return res.status(404).json({ message: 'Transport option not found' });
      }

      if (req.user?.type === 'provider' && transport.provider_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot delete other providers transport options' });
      }

      await transport.destroy();

      return res.status(200).json({ message: 'Transport option deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error deleting transport option', 
        error: error.message 
      });
    }
  };
}