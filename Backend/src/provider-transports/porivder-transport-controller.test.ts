import request from 'supertest';
import express from 'express';
import providerTransportsRoutes from './provider-transports-routes';

// Mock dependencies
jest.mock('../../models', () => ({
  ProviderTransport: {
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

describe('Provider Transports Routes Integration Tests', () => {
  let app: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/provider-transports', providerTransportsRoutes);
    jest.clearAllMocks();
  });

  describe('POST /provider-transports', () => {
    test('should create transport option successfully for provider', async () => {
      const mockTransport = {
        transport_id: 1,
        provider_id: 1,
        transportMethod: 'express',
        transportCost: 100.00,
        costPerKG: 10.00,
        toJSON: jest.fn().mockReturnValue({
          transport_id: 1,
          provider_id: 1,
          transportMethod: 'express',
          transportCost: 100.00,
          costPerKG: 10.00
        })
      };

      const { ProviderTransport } = require('../../models');
      ProviderTransport.create.mockResolvedValue(mockTransport);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/provider-transports', providerTransportsRoutes);

      const response = await request(authedApp)
        .post('/provider-transports')
        .send({
          transportMethod: 'express',
          transportCost: 100.00,
          costPerKG: 10.00
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Transport option created successfully');
      expect(ProviderTransport.create).toHaveBeenCalledWith({
        provider_id: 1,
        transportMethod: 'express',
        transportCost: 100.00,
        costPerKG: 10.00
      });
      expect(response.body.transport).toEqual(mockTransport.toJSON());
    });

    test('should return 403 for non-provider users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/provider-transports', providerTransportsRoutes);

      const response = await request(authedApp)
        .post('/provider-transports')
        .send({
          transportMethod: 'express',
          transportCost: 100.00,
          costPerKG: 10.00
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
      authedApp.use('/provider-transports', providerTransportsRoutes);

      const response = await request(authedApp)
        .post('/provider-transports')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing required fields: transportMethod, transportCost, costPerKG');
    });

    test('should handle duplicate primary key retry', async () => {
      const { ProviderTransport, sequelize } = require('../../models');
      
      const duplicateError = {
        code: '23505',
        constraint: 'provider_transports_pkey'
      };
      
      ProviderTransport.create
        .mockRejectedValueOnce(duplicateError)
        .mockResolvedValueOnce({
          transport_id: 1,
          provider_id: 1,
          transportMethod: 'express'
        });
      
      sequelize.query.mockResolvedValue(true);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/provider-transports', providerTransportsRoutes);

      const response = await request(authedApp)
        .post('/provider-transports')
        .send({
          transportMethod: 'express',
          transportCost: 100.00,
          costPerKG: 10.00
        });

      expect(response.status).toBe(201);
      expect(sequelize.query).toHaveBeenCalledWith(
        "SELECT nextval('provider_transports_transport_id_seq')"
      );
    });

    test('should handle max retries exceeded', async () => {
      const { ProviderTransport, sequelize } = require('../../models');
      
      const duplicateError = {
        code: '23505',
        constraint: 'provider_transports_pkey'
      };
      
      // Mock 20 consecutive duplicate errors
      ProviderTransport.create.mockRejectedValue(duplicateError);
      sequelize.query.mockResolvedValue(true);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/provider-transports', providerTransportsRoutes);

      const response = await request(authedApp)
        .post('/provider-transports')
        .send({
          transportMethod: 'express',
          transportCost: 100.00,
          costPerKG: 10.00
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toContain('Unable to create transport after');
    });
  });

  describe('GET /provider-transports', () => {
    test('should fetch all transport options with authentication', async () => {
      const mockTransports = [
        {
          transport_id: 1,
          provider_id: 1,
          transportMethod: 'express',
          provider: {
            provider_id: 1,
            businessName: 'Test Provider'
          }
        }
      ];

      const { ProviderTransport } = require('../../models');
      ProviderTransport.findAll.mockResolvedValue(mockTransports);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/provider-transports', providerTransportsRoutes);

      const response = await request(authedApp)
        .get('/provider-transports');

      expect(response.status).toBe(200);
      expect(response.body.transports).toEqual(mockTransports);
      expect(ProviderTransport.findAll).toHaveBeenCalledWith({
        include: [{
          model: expect.anything(),
          as: 'provider',
          attributes: { exclude: ['password'] }
        }]
      });
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/provider-transports');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    test('should return empty array when no transports', async () => {
      const { ProviderTransport } = require('../../models');
      ProviderTransport.findAll.mockResolvedValue([]);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/provider-transports', providerTransportsRoutes);

      const response = await request(authedApp)
        .get('/provider-transports');

      expect(response.status).toBe(200);
      expect(response.body.transports).toEqual([]);
    });
  });

  describe('GET /provider-transports/:id', () => {
    test('should fetch transport option by ID', async () => {
      const mockTransport = {
        transport_id: 1,
        provider_id: 1,
        transportMethod: 'express',
        provider: {
          provider_id: 1,
          businessName: 'Test Provider'
        }
      };

      const { ProviderTransport } = require('../../models');
      ProviderTransport.findByPk.mockResolvedValue(mockTransport);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/provider-transports', providerTransportsRoutes);

      const response = await request(authedApp)
        .get('/provider-transports/1');

      expect(response.status).toBe(200);
      expect(response.body.transport).toEqual(mockTransport);
    });

    test('should return 404 when transport not found', async () => {
      const { ProviderTransport } = require('../../models');
      ProviderTransport.findByPk.mockResolvedValue(null);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/provider-transports', providerTransportsRoutes);

      const response = await request(authedApp)
        .get('/provider-transports/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Transport option not found');
    });
  });

  describe('PUT /provider-transports/:id', () => {
    test('should update transport option for owner provider', async () => {
      const mockTransport = {
        transport_id: 1,
        provider_id: 1,
        transportMethod: 'express',
        transportCost: 100.00,
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          transport_id: 1,
          provider_id: 1,
          transportMethod: 'standard',
          transportCost: 80.00,
          costPerKG: 8.00
        })
      };

      const { ProviderTransport } = require('../../models');
      ProviderTransport.findByPk.mockResolvedValue(mockTransport);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/provider-transports', providerTransportsRoutes);

      const response = await request(authedApp)
        .put('/provider-transports/1')
        .send({
          transportMethod: 'standard',
          transportCost: 80.00,
          costPerKG: 8.00
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Transport option updated successfully');
      expect(mockTransport.update).toHaveBeenCalledWith({
        transportMethod: 'standard',
        transportCost: 80.00,
        costPerKG: 8.00
      });
      expect(response.body.transport).toEqual(mockTransport.toJSON());
    });

    test('should return 403 when provider updates other provider transport', async () => {
      const mockTransport = {
        transport_id: 1,
        provider_id: 999 // Different provider
      };

      const { ProviderTransport } = require('../../models');
      ProviderTransport.findByPk.mockResolvedValue(mockTransport);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/provider-transports', providerTransportsRoutes);

      const response = await request(authedApp)
        .put('/provider-transports/1')
        .send({
          transportCost: 80.00
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot update other providers transport options');
    });

    test('should return 403 for non-provider users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/provider-transports', providerTransportsRoutes);

      const response = await request(authedApp)
        .put('/provider-transports/1')
        .send({
          transportCost: 80.00
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    test('should return 404 when transport not found', async () => {
      const { ProviderTransport } = require('../../models');
      ProviderTransport.findByPk.mockResolvedValue(null);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/provider-transports', providerTransportsRoutes);

      const response = await request(authedApp)
        .put('/provider-transports/999')
        .send({
          transportCost: 80.00
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Transport option not found');
    });
  });

  describe('DELETE /provider-transports/:id', () => {
    test('should delete transport option for owner provider', async () => {
      const mockTransport = {
        transport_id: 1,
        provider_id: 1,
        destroy: jest.fn().mockResolvedValue(true)
      };

      const { ProviderTransport } = require('../../models');
      ProviderTransport.findByPk.mockResolvedValue(mockTransport);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/provider-transports', providerTransportsRoutes);

      const response = await request(authedApp)
        .delete('/provider-transports/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Transport option deleted successfully');
      expect(mockTransport.destroy).toHaveBeenCalled();
    });

    test('should return 403 when provider deletes other provider transport', async () => {
      const mockTransport = {
        transport_id: 1,
        provider_id: 999 // Different provider
      };

      const { ProviderTransport } = require('../../models');
      ProviderTransport.findByPk.mockResolvedValue(mockTransport);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/provider-transports', providerTransportsRoutes);

      const response = await request(authedApp)
        .delete('/provider-transports/1');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot delete other providers transport options');
    });

    test('should return 403 for non-provider users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/provider-transports', providerTransportsRoutes);

      const response = await request(authedApp)
        .delete('/provider-transports/1');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    test('should return 404 when transport not found', async () => {
      const { ProviderTransport } = require('../../models');
      ProviderTransport.findByPk.mockResolvedValue(null);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/provider-transports', providerTransportsRoutes);

      const response = await request(authedApp)
        .delete('/provider-transports/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Transport option not found');
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors on create', async () => {
      const error = new Error('Database connection failed');
      const { ProviderTransport } = require('../../models');
      ProviderTransport.create.mockRejectedValue(error);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/provider-transports', providerTransportsRoutes);

      const response = await request(authedApp)
        .post('/provider-transports')
        .send({
          transportMethod: 'express',
          transportCost: 100.00,
          costPerKG: 10.00
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error creating transport option');
    });

    test('should handle database errors on fetch all', async () => {
      const error = new Error('Database error');
      const { ProviderTransport } = require('../../models');
      ProviderTransport.findAll.mockRejectedValue(error);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/provider-transports', providerTransportsRoutes);

      const response = await request(authedApp)
        .get('/provider-transports');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error fetching transport options');
    });

    test('should handle database errors on fetch by ID', async () => {
      const error = new Error('Database error');
      const { ProviderTransport } = require('../../models');
      ProviderTransport.findByPk.mockRejectedValue(error);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/provider-transports', providerTransportsRoutes);

      const response = await request(authedApp)
        .get('/provider-transports/1');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error fetching transport option');
    });

    test('should handle database errors on update', async () => {
      const mockTransport = {
        transport_id: 1,
        provider_id: 1,
        update: jest.fn().mockRejectedValue(new Error('Update failed'))
      };

      const { ProviderTransport } = require('../../models');
      ProviderTransport.findByPk.mockResolvedValue(mockTransport);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/provider-transports', providerTransportsRoutes);

      const response = await request(authedApp)
        .put('/provider-transports/1')
        .send({
          transportCost: 80.00
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error updating transport option');
    });

    test('should handle database errors on delete', async () => {
      const mockTransport = {
        transport_id: 1,
        provider_id: 1,
        destroy: jest.fn().mockRejectedValue(new Error('Delete failed'))
      };

      const { ProviderTransport } = require('../../models');
      ProviderTransport.findByPk.mockResolvedValue(mockTransport);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/provider-transports', providerTransportsRoutes);

      const response = await request(authedApp)
        .delete('/provider-transports/1');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error deleting transport option');
    });
  });
});