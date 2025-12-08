import { Response } from 'express';
import { AuthRequest } from '../middleware/auth-middleware';
import { getImageUrl } from '../file-upload/upload-middleware';
import { deleteImageById } from '../file-upload/upload-middleware';
const db = require('../../models');

export class SubstancesController {
  static create = async (req: AuthRequest, res: Response) => {
    const maxRetries = 20;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        if (!req.user || req.user.type !== 'provider') {
          return res.status(403).json({ message: 'Only providers can create substances' });
        }

        const { substanceName, category, description, pricePerUnit, stockQuantity } = req.body;

        if (attempts === 0) {
          if (!substanceName || !category || !pricePerUnit) {
            return res.status(400).json({ 
              message: 'Missing required fields: substanceName, category, pricePerUnit' 
            });
          }
        }

        const substance = await db.Substance.create({
          provider_id: req.user.id,
          substanceName,
          category,
          description,
          pricePerUnit,
          stockQuantity: stockQuantity || 0
        });

        return res.status(201).json({
          message: 'Substance created successfully',
          substance
        });
      } catch (error: any) {
        console.error(`Error creating substance (attempt ${attempts + 1}):`, error.message);
        
        if ((error.code === '23505' || error.parent?.code === '23505') && 
            (error.constraint?.includes('_pkey') || error.parent?.constraint?.includes('_pkey'))) {
          attempts++;
          
          try {
            await db.sequelize.query(`SELECT nextval('substances_substance_id_seq')`);
            console.log('Advanced substances sequence, retrying...');
            continue;
          } catch (seqError) {
            console.error('Error advancing sequence:', seqError);
          }
          
          if (attempts >= maxRetries) {
            return res.status(500).json({ 
              message: `Unable to create substance after ${maxRetries} attempts. Please contact support.`,
              error: 'ID generation failed'
            });
          }
          continue;
        }
        
        return res.status(500).json({ 
          message: 'Error creating substance', 
          error: error.message 
        });
      }
    }
  };

  static getAll = async (req: AuthRequest, res: Response) => {
  try {
    const substances = await db.Substance.findAll({
      include: [{
        model: db.Provider,
        as: 'provider',
        attributes: { exclude: ['password'] }
      }]
    });

   
      const substancesWithImages = substances.map((substance: any) => {
        const substanceData = substance.toJSON();
        return {
          ...substanceData,
          image_url: getImageUrl('substance', substance.substance_id)
        };
      });

      return res.status(200).json({ substances: substancesWithImages });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error fetching substances', 
        error: error.message 
      });
    }
  };

  static getById = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const substance = await db.Substance.findByPk(id, {
        include: [{
          model: db.Provider,
          as: 'provider',
          attributes: { exclude: ['password'] }
        }]
      });

      if (!substance) {
        return res.status(404).json({ message: 'Substance not found' });
      }

      const substanceData = substance.toJSON();
      const substanceWithImage = {
      ...substanceData,
      image_url: getImageUrl('substance', parseInt(id))
    };

      return res.status(200).json({ substance: substanceWithImage });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error fetching substance', 
        error: error.message 
      });
    }
  };

  static update = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const substance = await db.Substance.findByPk(id);

      if (!substance) {
        return res.status(404).json({ message: 'Substance not found' });
      }

      if (req.user?.type === 'provider' && substance.provider_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot update other providers substances' });
      }

      await substance.update(req.body);

      return res.status(200).json({
        message: 'Substance updated successfully',
        substance
      });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error updating substance', 
        error: error.message 
      });
    }
  };

  static delete = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const substance = await db.Substance.findByPk(id);

    if (!substance) {
      return res.status(404).json({ message: 'Substance not found' });
    }

    if (req.user?.type === 'provider' && substance.provider_id !== req.user.id) {
      return res.status(403).json({ message: 'Cannot delete other providers substances' });
    }

    deleteImageById('substance', parseInt(id));

    await substance.destroy();

    return res.status(200).json({ message: 'Substance deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ 
      message: 'Error deleting substance', 
      error: error.message 
    });
  }
};
}