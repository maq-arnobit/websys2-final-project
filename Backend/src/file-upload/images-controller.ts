import { Response } from 'express';
import { AuthRequest } from '../auth/auth-middleware';
import { saveImageWithId, deleteImageById, getImageUrl } from './upload-middleware';
import fs from 'fs';

import db from '../../models';

export class ImageController {
  static uploadSubstanceImage = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || req.user.type !== 'provider') {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(403).json({ message: 'Only providers can upload substance images' });
      }

      const { substanceId } = req.params;

      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      const substance = await db.Substance.findByPk(substanceId);
      
      if (!substance) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Substance not found' });
      }

      if (substance.provider_id !== req.user.id) {
        fs.unlinkSync(req.file.path);
        return res.status(403).json({ message: 'Cannot upload image for other providers substances' });
      }

      const imageUrl = saveImageWithId(req.file.path, 'substance', parseInt(substanceId));

      return res.status(200).json({
        message: 'Image uploaded successfully',
        imageUrl,
        substance_id: substanceId
      });
    } catch (error: any) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(500).json({ 
        message: 'Error uploading image', 
        error: error.message 
      });
    }
  };

  static uploadInventoryImage = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || req.user.type !== 'dealer') {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(403).json({ message: 'Only dealers can upload inventory images' });
      }

      const { inventoryId } = req.params;

      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      const inventory = await db.Inventory.findByPk(inventoryId);
      
      if (!inventory) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Inventory not found' });
      }

      if (inventory.dealer_id !== req.user.id) {
        fs.unlinkSync(req.file.path);
        return res.status(403).json({ message: 'Cannot upload image for other dealers inventory' });
      }

      const imageUrl = saveImageWithId(req.file.path, 'inventory', parseInt(inventoryId));

      return res.status(200).json({
        message: 'Image uploaded successfully',
        imageUrl,
        inventory_id: inventoryId
      });
    } catch (error: any) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(500).json({ 
        message: 'Error uploading image', 
        error: error.message 
      });
    }
  };

  static deleteSubstanceImage = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || req.user.type !== 'provider') {
        return res.status(403).json({ message: 'Only providers can delete substance images' });
      }

      const { substanceId } = req.params;

      const substance = await db.Substance.findByPk(substanceId);
      
      if (!substance) {
        return res.status(404).json({ message: 'Substance not found' });
      }

      if (substance.provider_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot delete image for other providers substances' });
      }

      deleteImageById('substance', parseInt(substanceId));

      return res.status(200).json({
        message: 'Image deleted successfully',
        substance_id: substanceId
      });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error deleting image', 
        error: error.message 
      });
    }
  };

  static deleteInventoryImage = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || req.user.type !== 'dealer') {
        return res.status(403).json({ message: 'Only dealers can delete inventory images' });
      }

      const { inventoryId } = req.params;

      const inventory = await db.Inventory.findByPk(inventoryId);
      
      if (!inventory) {
        return res.status(404).json({ message: 'Inventory not found' });
      }

      if (inventory.dealer_id !== req.user.id) {
        return res.status(403).json({ message: 'Cannot delete image for other dealers inventory' });
      }

      deleteImageById('inventory', parseInt(inventoryId));

      return res.status(200).json({
        message: 'Image deleted successfully',
        inventory_id: inventoryId
      });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error deleting image', 
        error: error.message 
      });
    }
  };

  static getImageUrl = async (req: AuthRequest, res: Response) => {
    try {
      const { type, id } = req.params;

      const validTypes = ['substance', 'inventory', 'dealer', 'customer', 'provider'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: 'Invalid type' });
      }

      const imageUrl = getImageUrl(type as any, parseInt(id));

      if (!imageUrl) {
        return res.status(404).json({ message: 'Image not found' });
      }

      return res.status(200).json({
        imageUrl,
        type,
        id
      });
    } catch (error: any) {
      return res.status(500).json({ 
        message: 'Error fetching image URL', 
        error: error.message 
      });
    }
  };
}