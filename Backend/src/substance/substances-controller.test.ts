import request from 'supertest';
import express from 'express';
import substancesRoutes from './substances-routes';

// Mock dependencies
jest.mock('../../models', () => ({
  Substance: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn()
  },
  Provider: {},
  sequelize: {
    query: jest.fn()
  }
}));

jest.mock('../file-upload/upload-middleware', () => ({
  getImageUrl: jest.fn(),
  deleteImageById: jest.fn()
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

describe('Substance Routes Integration Tests', () => {
  let app: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/substances', substancesRoutes);
    jest.clearAllMocks();
  });

  describe('POST /substances', () => {
    test('should create substance successfully for provider', async () => {
      const mockSubstance = {
        substance_id: 1,
        provider_id: 1,
        substanceName: 'Test Substance',
        category: 'Test Category',
        pricePerUnit: 25.50,
        stockQuantity: 100,
        toJSON: jest.fn().mockReturnValue({
          substance_id: 1,
          substanceName: 'Test Substance',
          pricePerUnit: 25.50
        })
      };

      const { Substance } = require('../../models');
      Substance.create.mockResolvedValue(mockSubstance);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/substances', substancesRoutes);

      const response = await request(authedApp)
        .post('/substances')
        .send({
          substanceName: 'Test Substance',
          category: 'Test Category',
          description: 'Test Description',
          pricePerUnit: 25.50,
          stockQuantity: 100
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Substance created successfully');
      expect(Substance.create).toHaveBeenCalledWith({
        provider_id: 1,
        substanceName: 'Test Substance',
        category: 'Test Category',
        description: 'Test Description',
        pricePerUnit: 25.50,
        stockQuantity: 100
      });
    });

    test('should return 403 for non-provider users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/substances', substancesRoutes);

      const response = await request(authedApp)
        .post('/substances')
        .send({
          substanceName: 'Test Substance',
          category: 'Test Category',
          pricePerUnit: 25.50
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    test('should validate required fields', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/substances', substancesRoutes);

      const response = await request(authedApp)
        .post('/substances')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing required fields: substanceName, category, pricePerUnit');
    });

    test('should use default stockQuantity when not provided', async () => {
      const mockSubstance = {
        substance_id: 1,
        toJSON: jest.fn().mockReturnValue({ substance_id: 1 })
      };

      const { Substance } = require('../../models');
      Substance.create.mockResolvedValue(mockSubstance);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/substances', substancesRoutes);

      const response = await request(authedApp)
        .post('/substances')
        .send({
          substanceName: 'Test Substance',
          category: 'Test Category',
          pricePerUnit: 25.50
          // No stockQuantity provided
        });

      expect(response.status).toBe(201);
      expect(Substance.create).toHaveBeenCalledWith({
        provider_id: 1,
        substanceName: 'Test Substance',
        category: 'Test Category',
        pricePerUnit: 25.50,
        stockQuantity: 0
      });
    });

    test('should handle duplicate primary key retry', async () => {
      const { Substance, sequelize } = require('../../models');
      
      const duplicateError = {
        code: '23505',
        constraint: 'substances_pkey'
      };
      
      Substance.create
        .mockRejectedValueOnce(duplicateError)
        .mockResolvedValueOnce({ substance_id: 1 });
      
      sequelize.query.mockResolvedValue(true);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/substances', substancesRoutes);

      const response = await request(authedApp)
        .post('/substances')
        .send({
          substanceName: 'Test Substance',
          category: 'Test Category',
          pricePerUnit: 25.50
        });

      expect(response.status).toBe(201);
      expect(sequelize.query).toHaveBeenCalledWith(
        "SELECT nextval('substances_substance_id_seq')"
      );
    });

    test('should handle max retries exceeded', async () => {
      const { Substance, sequelize } = require('../../models');
      
      const duplicateError = {
        code: '23505',
        constraint: 'substances_pkey'
      };
      
      // Mock 20 consecutive duplicate errors
      Substance.create.mockRejectedValue(duplicateError);
      sequelize.query.mockResolvedValue(true);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/substances', substancesRoutes);

      const response = await request(authedApp)
        .post('/substances')
        .send({
          substanceName: 'Test Substance',
          category: 'Test Category',
          pricePerUnit: 25.50
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toContain('Unable to create substance after');
    });
  });

  describe('GET /substances', () => {
    test('should fetch all substances with authentication', async () => {
      const mockSubstance = {
        substance_id: 1,
        toJSON: jest.fn().mockReturnValue({
          substance_id: 1,
          substanceName: 'Test Substance',
          provider: { provider_id: 1 }
        })
      };

      const mockSubstances = [mockSubstance];

      const { Substance } = require('../../models');
      Substance.findAll.mockResolvedValue(mockSubstances);

      const { getImageUrl } = require('../file-upload/upload-middleware');
      getImageUrl.mockReturnValue('http://example.com/substance/1.jpg');

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/substances', substancesRoutes);

      const response = await request(authedApp)
        .get('/substances');

      expect(response.status).toBe(200);
      expect(response.body.substances[0]).toEqual({
        substance_id: 1,
        substanceName: 'Test Substance',
        provider: { provider_id: 1 },
        image_url: 'http://example.com/substance/1.jpg'
      });
      expect(Substance.findAll).toHaveBeenCalledWith({
        include: [{
          model: expect.anything(),
          as: 'provider',
          attributes: { exclude: ['password'] }
        }]
      });
      expect(getImageUrl).toHaveBeenCalledWith('substance', 1);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/substances');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    test('should return empty array when no substances', async () => {
      const { Substance } = require('../../models');
      Substance.findAll.mockResolvedValue([]);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/substances', substancesRoutes);

      const response = await request(authedApp)
        .get('/substances');

      expect(response.status).toBe(200);
      expect(response.body.substances).toEqual([]);
    });
  });

  describe('GET /substances/:id', () => {
    test('should fetch substance by ID with image URL', async () => {
      const mockSubstance = {
        substance_id: 1,
        toJSON: jest.fn().mockReturnValue({
          substance_id: 1,
          substanceName: 'Test Substance',
          provider: { provider_id: 1 }
        })
      };

      const { Substance } = require('../../models');
      Substance.findByPk.mockResolvedValue(mockSubstance);

      const { getImageUrl } = require('../file-upload/upload-middleware');
      getImageUrl.mockReturnValue('http://example.com/substance/1.jpg');

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/substances', substancesRoutes);

      const response = await request(authedApp)
        .get('/substances/1');

      expect(response.status).toBe(200);
      expect(response.body.substance).toEqual({
        substance_id: 1,
        substanceName: 'Test Substance',
        provider: { provider_id: 1 },
        image_url: 'http://example.com/substance/1.jpg'
      });
      expect(getImageUrl).toHaveBeenCalledWith('substance', 1);
    });

    test('should return 404 when substance not found', async () => {
      const { Substance } = require('../../models');
      Substance.findByPk.mockResolvedValue(null);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/substances', substancesRoutes);

      const response = await request(authedApp)
        .get('/substances/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Substance not found');
    });

    test('should handle missing image gracefully', async () => {
      const mockSubstance = {
        substance_id: 1,
        toJSON: jest.fn().mockReturnValue({
          substance_id: 1,
          substanceName: 'Test Substance',
          provider: { provider_id: 1 }
        })
      };

      const { Substance } = require('../../models');
      Substance.findByPk.mockResolvedValue(mockSubstance);

      const { getImageUrl } = require('../file-upload/upload-middleware');
      getImageUrl.mockReturnValue(null);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/substances', substancesRoutes);

      const response = await request(authedApp)
        .get('/substances/1');

      expect(response.status).toBe(200);
      expect(response.body.substance.image_url).toBeNull();
    });
  });

  describe('PUT /substances/:id', () => {
    test('should update substance for owner provider', async () => {
      const mockSubstance = {
        substance_id: 1,
        provider_id: 1,
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          substance_id: 1,
          substanceName: 'Updated Substance',
          pricePerUnit: 30.00
        })
      };

      const { Substance } = require('../../models');
      Substance.findByPk.mockResolvedValue(mockSubstance);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/substances', substancesRoutes);

      const response = await request(authedApp)
        .put('/substances/1')
        .send({
          substanceName: 'Updated Substance',
          pricePerUnit: 30.00
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Substance updated successfully');
      expect(mockSubstance.update).toHaveBeenCalledWith({
        substanceName: 'Updated Substance',
        pricePerUnit: 30.00
      });
      expect(response.body.substance).toEqual(mockSubstance.toJSON());
    });

    test('should return 403 when provider updates other provider substance', async () => {
      const mockSubstance = {
        substance_id: 1,
        provider_id: 999 // Different provider
      };

      const { Substance } = require('../../models');
      Substance.findByPk.mockResolvedValue(mockSubstance);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/substances', substancesRoutes);

      const response = await request(authedApp)
        .put('/substances/1')
        .send({
          pricePerUnit: 30.00
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot update other providers substances');
    });

    test('should return 403 for non-provider users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/substances', substancesRoutes);

      const response = await request(authedApp)
        .put('/substances/1')
        .send({
          pricePerUnit: 30.00
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    test('should return 404 when substance not found', async () => {
      const { Substance } = require('../../models');
      Substance.findByPk.mockResolvedValue(null);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/substances', substancesRoutes);

      const response = await request(authedApp)
        .put('/substances/999')
        .send({
          pricePerUnit: 30.00
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Substance not found');
    });
  });

  describe('DELETE /substances/:id', () => {
    test('should delete substance for owner provider', async () => {
      const mockSubstance = {
        substance_id: 1,
        provider_id: 1,
        destroy: jest.fn().mockResolvedValue(true)
      };

      const { Substance } = require('../../models');
      Substance.findByPk.mockResolvedValue(mockSubstance);

      const { deleteImageById } = require('../file-upload/upload-middleware');

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/substances', substancesRoutes);

      const response = await request(authedApp)
        .delete('/substances/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Substance deleted successfully');
      expect(deleteImageById).toHaveBeenCalledWith('substance', 1);
      expect(mockSubstance.destroy).toHaveBeenCalled();
    });

    test('should return 403 when provider deletes other provider substance', async () => {
      const mockSubstance = {
        substance_id: 1,
        provider_id: 999 // Different provider
      };

      const { Substance } = require('../../models');
      Substance.findByPk.mockResolvedValue(mockSubstance);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/substances', substancesRoutes);

      const response = await request(authedApp)
        .delete('/substances/1');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot delete other providers substances');
    });

    test('should return 403 for non-provider users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/substances', substancesRoutes);

      const response = await request(authedApp)
        .delete('/substances/1');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    test('should return 404 when substance not found', async () => {
      const { Substance } = require('../../models');
      Substance.findByPk.mockResolvedValue(null);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/substances', substancesRoutes);

      const response = await request(authedApp)
        .delete('/substances/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Substance not found');
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors on create', async () => {
      const error = new Error('Database connection failed');
      const { Substance } = require('../../models');
      Substance.create.mockRejectedValue(error);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/substances', substancesRoutes);

      const response = await request(authedApp)
        .post('/substances')
        .send({
          substanceName: 'Test Substance',
          category: 'Test Category',
          pricePerUnit: 25.50
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error creating substance');
    });

    test('should handle database errors on fetch all', async () => {
      const error = new Error('Database error');
      const { Substance } = require('../../models');
      Substance.findAll.mockRejectedValue(error);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/substances', substancesRoutes);

      const response = await request(authedApp)
        .get('/substances');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error fetching substances');
    });

    test('should handle database errors on fetch by ID', async () => {
      const error = new Error('Database error');
      const { Substance } = require('../../models');
      Substance.findByPk.mockRejectedValue(error);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/substances', substancesRoutes);

      const response = await request(authedApp)
        .get('/substances/1');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error fetching substance');
    });

    test('should handle database errors on update', async () => {
      const mockSubstance = {
        substance_id: 1,
        provider_id: 1,
        update: jest.fn().mockRejectedValue(new Error('Update failed'))
      };

      const { Substance } = require('../../models');
      Substance.findByPk.mockResolvedValue(mockSubstance);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/substances', substancesRoutes);

      const response = await request(authedApp)
        .put('/substances/1')
        .send({
          pricePerUnit: 30.00
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error updating substance');
    });

    test('should handle database errors on delete', async () => {
      const mockSubstance = {
        substance_id: 1,
        provider_id: 1,
        destroy: jest.fn().mockRejectedValue(new Error('Delete failed'))
      };

      const { Substance } = require('../../models');
      Substance.findByPk.mockResolvedValue(mockSubstance);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/substances', substancesRoutes);

      const response = await request(authedApp)
        .delete('/substances/1');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error deleting substance');
    });
  });
});