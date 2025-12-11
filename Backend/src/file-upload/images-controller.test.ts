import request from 'supertest';
import express from 'express';
import imagesRoutes from './images-routes';

// Mock dependencies
jest.mock('../../models', () => ({
  Substance: {
    findByPk: jest.fn()
  },
  Inventory: {
    findByPk: jest.fn()
  }
}));

jest.mock('./upload-middleware', () => ({
  upload: {
    single: jest.fn(() => (req: any, res: any, next: any) => {
      req.file = {
        path: '/tmp/test-image.jpg',
        originalname: 'test.jpg',
        mimetype: 'image/jpeg'
      };
      next();
    })
  },
  saveImageWithId: jest.fn(),
  deleteImageById: jest.fn(),
  getImageUrl: jest.fn()
}));

jest.mock('fs', () => ({
  unlinkSync: jest.fn()
}));

// Mock auth middleware
jest.mock('../auth/auth-middleware', () => ({
  authenticate: (allowedTypes?: string[]) => {
    return (req: any, res: any, next: any) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      if (allowedTypes && !allowedTypes.includes(req.user.type)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      next();
    };
  }
}));

describe('Image Routes Integration Tests', () => {
  let app: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/images', imagesRoutes);
    jest.clearAllMocks();
  });

  describe('POST /images/substance/:substanceId', () => {
    test('should upload substance image successfully for provider', async () => {
      const mockSubstance = {
        substance_id: 5,
        provider_id: 1
      };

      const { Substance } = require('../../models');
      Substance.findByPk.mockResolvedValue(mockSubstance);

      const { saveImageWithId } = require('./upload-middleware');
      saveImageWithId.mockReturnValue('http://example.com/substance/5.jpg');

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/images', imagesRoutes);

      const response = await request(authedApp)
        .post('/images/substance/5')
        .attach('image', Buffer.from('test'), 'test.jpg');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Image uploaded successfully',
        imageUrl: 'http://example.com/substance/5.jpg',
        substance_id: '5'
      });
      expect(saveImageWithId).toHaveBeenCalledWith('/tmp/test-image.jpg', 'substance', 5);
    });

    test('should return 403 for non-provider users', async () => {
      const { fs } = require('fs');
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/images', imagesRoutes);

      const response = await request(authedApp)
        .post('/images/substance/5')
        .attach('image', Buffer.from('test'), 'test.jpg');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    test('should return 400 when no file provided', async () => {
      // Override the upload middleware to simulate no file
      const originalUpload = require('./upload-middleware').upload.single;
      require('./upload-middleware').upload.single = () => (req: any, res: any, next: any) => {
        req.file = undefined;
        next();
      };

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/images', imagesRoutes);

      const response = await request(authedApp)
        .post('/images/substance/5')
        .attach('image', Buffer.from('test'), 'test.jpg');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('No image file provided');

      // Restore original mock
      require('./upload-middleware').upload.single = originalUpload;
    });

    test('should return 404 when substance not found', async () => {
      const { Substance, fs } = require('../../models');
      Substance.findByPk.mockResolvedValue(null);
      const { unlinkSync } = require('fs');

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/images', imagesRoutes);

      const response = await request(authedApp)
        .post('/images/substance/999')
        .attach('image', Buffer.from('test'), 'test.jpg');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Substance not found');
      expect(unlinkSync).toHaveBeenCalledWith('/tmp/test-image.jpg');
    });

    test('should return 403 when uploading for other provider substance', async () => {
      const mockSubstance = {
        substance_id: 5,
        provider_id: 2 // Different provider
      };

      const { Substance } = require('../../models');
      Substance.findByPk.mockResolvedValue(mockSubstance);
      const { unlinkSync } = require('fs');

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/images', imagesRoutes);

      const response = await request(authedApp)
        .post('/images/substance/5')
        .attach('image', Buffer.from('test'), 'test.jpg');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot upload image for other providers substances');
      expect(unlinkSync).toHaveBeenCalledWith('/tmp/test-image.jpg');
    });

    test('should cleanup temp file on error', async () => {
      const error = new Error('Database error');
      const { Substance } = require('../../models');
      Substance.findByPk.mockRejectedValue(error);
      const { unlinkSync } = require('fs');

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/images', imagesRoutes);

      const response = await request(authedApp)
        .post('/images/substance/5')
        .attach('image', Buffer.from('test'), 'test.jpg');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error uploading image');
      expect(unlinkSync).toHaveBeenCalledWith('/tmp/test-image.jpg');
    });
  });

  describe('POST /images/inventory/:inventoryId', () => {
    test('should upload inventory image successfully for dealer', async () => {
      const mockInventory = {
        inventory_id: 10,
        dealer_id: 1
      };

      const { Inventory } = require('../../models');
      Inventory.findByPk.mockResolvedValue(mockInventory);

      const { saveImageWithId } = require('./upload-middleware');
      saveImageWithId.mockReturnValue('http://example.com/inventory/10.jpg');

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/images', imagesRoutes);

      const response = await request(authedApp)
        .post('/images/inventory/10')
        .attach('image', Buffer.from('test'), 'test.jpg');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Image uploaded successfully',
        imageUrl: 'http://example.com/inventory/10.jpg',
        inventory_id: '10'
      });
      expect(saveImageWithId).toHaveBeenCalledWith('/tmp/test-image.jpg', 'inventory', 10);
    });

    test('should return 403 for non-dealer users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/images', imagesRoutes);

      const response = await request(authedApp)
        .post('/images/inventory/10')
        .attach('image', Buffer.from('test'), 'test.jpg');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });
  });

  describe('DELETE /images/substance/:substanceId', () => {
    test('should delete substance image successfully for owner provider', async () => {
      const mockSubstance = {
        substance_id: 5,
        provider_id: 1
      };

      const { Substance } = require('../../models');
      Substance.findByPk.mockResolvedValue(mockSubstance);

      const { deleteImageById } = require('./upload-middleware');

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/images', imagesRoutes);

      const response = await request(authedApp)
        .delete('/images/substance/5');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Image deleted successfully');
      expect(deleteImageById).toHaveBeenCalledWith('substance', 5);
    });

    test('should return 403 for non-provider users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/images', imagesRoutes);

      const response = await request(authedApp)
        .delete('/images/substance/5');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    test('should return 403 when deleting other provider substance image', async () => {
      const mockSubstance = {
        substance_id: 5,
        provider_id: 2 // Different provider
      };

      const { Substance } = require('../../models');
      Substance.findByPk.mockResolvedValue(mockSubstance);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/images', imagesRoutes);

      const response = await request(authedApp)
        .delete('/images/substance/5');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot delete image for other providers substances');
    });
  });

  describe('DELETE /images/inventory/:inventoryId', () => {
    test('should delete inventory image successfully for owner dealer', async () => {
      const mockInventory = {
        inventory_id: 10,
        dealer_id: 1
      };

      const { Inventory } = require('../../models');
      Inventory.findByPk.mockResolvedValue(mockInventory);

      const { deleteImageById } = require('./upload-middleware');

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/images', imagesRoutes);

      const response = await request(authedApp)
        .delete('/images/inventory/10');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Image deleted successfully');
      expect(deleteImageById).toHaveBeenCalledWith('inventory', 10);
    });

    test('should return 403 for non-dealer users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/images', imagesRoutes);

      const response = await request(authedApp)
        .delete('/images/inventory/10');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });
  });

  describe('GET /images/:type/:id', () => {
    test('should get image URL successfully', async () => {
      const { getImageUrl } = require('./upload-middleware');
      getImageUrl.mockReturnValue('http://example.com/substance/5.jpg');

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/images', imagesRoutes);

      const response = await request(authedApp)
        .get('/images/substance/5');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        imageUrl: 'http://example.com/substance/5.jpg',
        type: 'substance',
        id: '5'
      });
      expect(getImageUrl).toHaveBeenCalledWith('substance', 5);
    });

    test('should validate image type', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/images', imagesRoutes);

      const response = await request(authedApp)
        .get('/images/invalid/5');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid type');
    });

    test('should return 404 when image not found', async () => {
      const { getImageUrl } = require('./upload-middleware');
      getImageUrl.mockReturnValue(null);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/images', imagesRoutes);

      const response = await request(authedApp)
        .get('/images/substance/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Image not found');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/images/substance/5');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    test('should get image URL for dealer type', async () => {
      const { getImageUrl } = require('./upload-middleware');
      getImageUrl.mockReturnValue('http://example.com/dealer/3.jpg');

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/images', imagesRoutes);

      const response = await request(authedApp)
        .get('/images/dealer/3');

      expect(response.status).toBe(200);
      expect(getImageUrl).toHaveBeenCalledWith('dealer', 3);
    });

    test('should get image URL for customer type', async () => {
      const { getImageUrl } = require('./upload-middleware');
      getImageUrl.mockReturnValue('http://example.com/customer/2.jpg');

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/images', imagesRoutes);

      const response = await request(authedApp)
        .get('/images/customer/2');

      expect(response.status).toBe(200);
      expect(getImageUrl).toHaveBeenCalledWith('customer', 2);
    });

    test('should get image URL for provider type', async () => {
      const { getImageUrl } = require('./upload-middleware');
      getImageUrl.mockReturnValue('http://example.com/provider/4.jpg');

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/images', imagesRoutes);

      const response = await request(authedApp)
        .get('/images/provider/4');

      expect(response.status).toBe(200);
      expect(getImageUrl).toHaveBeenCalledWith('provider', 4);
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors on upload', async () => {
      const error = new Error('Database connection failed');
      const { Substance } = require('../../models');
      Substance.findByPk.mockRejectedValue(error);
      const { unlinkSync } = require('fs');

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/images', imagesRoutes);

      const response = await request(authedApp)
        .post('/images/substance/5')
        .attach('image', Buffer.from('test'), 'test.jpg');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error uploading image');
      expect(unlinkSync).toHaveBeenCalledWith('/tmp/test-image.jpg');
    });

    test('should handle errors on getImageUrl', async () => {
      const error = new Error('File system error');
      const { getImageUrl } = require('./upload-middleware');
      getImageUrl.mockImplementation(() => {
        throw error;
      });

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/images', imagesRoutes);

      const response = await request(authedApp)
        .get('/images/substance/5');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error fetching image URL');
    });
  });

  describe('Edge Cases', () => {
    test('should handle invalid substance ID format', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/images', imagesRoutes);

      // This will cause parseInt to return NaN
      const response = await request(authedApp)
        .delete('/images/substance/not-a-number');

      // The controller will try to parse "not-a-number" to int, which becomes NaN
      // The database query will likely fail or return null
      expect(response.status).toBe(404);
    });

    test('should handle invalid inventory ID format', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/images', imagesRoutes);

      const response = await request(authedApp)
        .delete('/images/inventory/invalid');

      expect(response.status).toBe(404);
    });
  });
});