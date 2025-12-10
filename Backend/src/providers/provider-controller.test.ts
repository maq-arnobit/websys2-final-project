import request from 'supertest';
import express from 'express';
import providersRoutes from './providers-routes';

// Mock dependencies
jest.mock('../../models', () => ({
  Provider: {
    findByPk: jest.fn(),
    destroy: jest.fn()
  },
  Substance: {
    findAll: jest.fn()
  },
  ProviderTransport: {
    findAll: jest.fn()
  },
  PurchaseOrder: {
    findAll: jest.fn()
  },
  Dealer: {},
  sequelize: {
    query: jest.fn()
  }
}));

jest.mock('../utils/utils', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed_password')
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

describe('Provider Routes Integration Tests', () => {
  let app: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/providers', providersRoutes);
    jest.clearAllMocks();
  });

  describe('GET /providers/:id', () => {
    test('should fetch provider profile for owner provider', async () => {
      const mockProvider = {
        provider_id: 1,
        username: 'testprovider',
        email: 'provider@example.com',
        businessName: 'Test Business'
      };

      const { Provider } = require('../../models');
      Provider.findByPk.mockResolvedValue(mockProvider);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/providers', providersRoutes);

      const response = await request(authedApp)
        .get('/providers/1');

      expect(response.status).toBe(200);
      expect(response.body.provider).toEqual(mockProvider);
      expect(Provider.findByPk).toHaveBeenCalledWith('1', {
        attributes: { exclude: ['password'] }
      });
    });

    test('should return 403 for non-provider users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/providers', providersRoutes);

      const response = await request(authedApp)
        .get('/providers/1');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    test('should return 403 when accessing other provider profile', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 2, type: 'provider' }; // Different provider
        next();
      });
      authedApp.use('/providers', providersRoutes);

      const response = await request(authedApp)
        .get('/providers/1');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot access other profiles');
    });

    test('should return 404 when provider not found', async () => {
      const { Provider } = require('../../models');
      Provider.findByPk.mockResolvedValue(null);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/providers', providersRoutes);

      const response = await request(authedApp)
        .get('/providers/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Provider not found');
    });
  });

  describe('PUT /providers/:id', () => {
    test('should update provider profile for owner provider', async () => {
      const mockProvider = {
        provider_id: 1,
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          provider_id: 1,
          username: 'updatedprovider'
        })
      };

      const updatedProvider = {
        provider_id: 1,
        username: 'updatedprovider',
        email: 'updated@example.com'
      };

      const { Provider } = require('../../models');
      Provider.findByPk
        .mockResolvedValueOnce(mockProvider)
        .mockResolvedValueOnce(updatedProvider);

      const { hashPassword } = require('../utils/utils');

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/providers', providersRoutes);

      const response = await request(authedApp)
        .put('/providers/1')
        .send({
          username: 'updatedprovider',
          email: 'updated@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Provider updated successfully');
      expect(mockProvider.update).toHaveBeenCalledWith({
        username: 'updatedprovider',
        email: 'updated@example.com'
      });
    });

    test('should update password when provided', async () => {
      const mockProvider = {
        provider_id: 1,
        update: jest.fn().mockResolvedValue(true)
      };

      const updatedProvider = {
        provider_id: 1,
        username: 'testprovider'
      };

      const { Provider } = require('../../models');
      Provider.findByPk
        .mockResolvedValueOnce(mockProvider)
        .mockResolvedValueOnce(updatedProvider);

      const { hashPassword } = require('../utils/utils');

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/providers', providersRoutes);

      const response = await request(authedApp)
        .put('/providers/1')
        .send({
          password: 'newpassword123'
        });

      expect(response.status).toBe(200);
      expect(hashPassword).toHaveBeenCalledWith('newpassword123');
      expect(mockProvider.update).toHaveBeenCalledWith({
        password: 'hashed_password'
      });
    });

    test('should handle duplicate username/email', async () => {
      const mockProvider = {
        provider_id: 1,
        update: jest.fn().mockRejectedValue({
          name: 'SequelizeUniqueConstraintError'
        })
      };

      const { Provider } = require('../../models');
      Provider.findByPk.mockResolvedValue(mockProvider);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/providers', providersRoutes);

      const response = await request(authedApp)
        .put('/providers/1')
        .send({
          username: 'existingusername'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username or email already exists');
    });

    test('should return 403 when updating other provider profile', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 2, type: 'provider' };
        next();
      });
      authedApp.use('/providers', providersRoutes);

      const response = await request(authedApp)
        .put('/providers/1')
        .send({
          username: 'updatedprovider'
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot update other profiles');
    });
  });

  describe('DELETE /providers/:id', () => {
    test('should delete provider account for owner provider', async () => {
      const mockProvider = {
        provider_id: 1,
        destroy: jest.fn().mockResolvedValue(true)
      };

      const { Provider } = require('../../models');
      Provider.findByPk.mockResolvedValue(mockProvider);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/providers', providersRoutes);

      const response = await request(authedApp)
        .delete('/providers/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Provider account deleted successfully');
      expect(mockProvider.destroy).toHaveBeenCalled();
    });

    test('should return 403 when deleting other provider account', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 2, type: 'provider' };
        next();
      });
      authedApp.use('/providers', providersRoutes);

      const response = await request(authedApp)
        .delete('/providers/1');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot delete other accounts');
    });

    test('should return 404 when provider not found', async () => {
      const { Provider } = require('../../models');
      Provider.findByPk.mockResolvedValue(null);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/providers', providersRoutes);

      const response = await request(authedApp)
        .delete('/providers/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Provider not found');
    });
  });

  describe('GET /providers/:id/substances', () => {
    test('should fetch provider substances for any authenticated user', async () => {
      const mockSubstances = [
        {
          substance_id: 1,
          name: 'Test Substance',
          provider_id: 1
        }
      ];

      const { Substance } = require('../../models');
      Substance.findAll.mockResolvedValue(mockSubstances);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/providers', providersRoutes);

      const response = await request(authedApp)
        .get('/providers/1/substances');

      expect(response.status).toBe(200);
      expect(response.body.substances).toEqual(mockSubstances);
      expect(Substance.findAll).toHaveBeenCalledWith({
        where: { provider_id: '1' }
      });
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/providers/1/substances');

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
      authedApp.use('/providers', providersRoutes);

      const response = await request(authedApp)
        .get('/providers/1/substances');

      expect(response.status).toBe(200);
      expect(response.body.substances).toEqual([]);
    });
  });

  describe('GET /providers/:id/transport-options', () => {
    test('should fetch provider transport options for any authenticated user', async () => {
      const mockTransportOptions = [
        {
          transport_id: 1,
          provider_id: 1,
          transportMethod: 'express',
          transportCost: 100.00
        }
      ];

      const { ProviderTransport } = require('../../models');
      ProviderTransport.findAll.mockResolvedValue(mockTransportOptions);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/providers', providersRoutes);

      const response = await request(authedApp)
        .get('/providers/1/transport-options');

      expect(response.status).toBe(200);
      expect(response.body.transportOptions).toEqual(mockTransportOptions);
      expect(ProviderTransport.findAll).toHaveBeenCalledWith({
        where: { provider_id: '1' }
      });
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/providers/1/transport-options');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('GET /providers/:id/purchase-orders', () => {
    test('should fetch purchase orders for owner provider', async () => {
      const mockPurchaseOrders = [
        {
          purchase_order_id: 1,
          provider_id: 1,
          dealer: { dealer_id: 2 },
          substance: { substance_id: 3 },
          transport: { transport_id: 4 }
        }
      ];

      const { PurchaseOrder } = require('../../models');
      PurchaseOrder.findAll.mockResolvedValue(mockPurchaseOrders);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/providers', providersRoutes);

      const response = await request(authedApp)
        .get('/providers/1/purchase-orders');

      expect(response.status).toBe(200);
      expect(response.body.purchaseOrders).toEqual(mockPurchaseOrders);
      expect(PurchaseOrder.findAll).toHaveBeenCalledWith({
        where: { provider_id: '1' },
        include: [
          { model: expect.anything(), as: 'dealer', attributes: { exclude: ['password'] } },
          { model: expect.anything(), as: 'substance' },
          { model: expect.anything(), as: 'transport' }
        ]
      });
    });

    test('should return 403 for non-provider users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/providers', providersRoutes);

      const response = await request(authedApp)
        .get('/providers/1/purchase-orders');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    test('should return 403 when accessing other provider purchase orders', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 2, type: 'provider' };
        next();
      });
      authedApp.use('/providers', providersRoutes);

      const response = await request(authedApp)
        .get('/providers/1/purchase-orders');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot view other provider purchase orders');
    });

    test('should return empty array when no purchase orders', async () => {
      const { PurchaseOrder } = require('../../models');
      PurchaseOrder.findAll.mockResolvedValue([]);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/providers', providersRoutes);

      const response = await request(authedApp)
        .get('/providers/1/purchase-orders');

      expect(response.status).toBe(200);
      expect(response.body.purchaseOrders).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors on getById', async () => {
      const error = new Error('Database error');
      const { Provider } = require('../../models');
      Provider.findByPk.mockRejectedValue(error);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/providers', providersRoutes);

      const response = await request(authedApp)
        .get('/providers/1');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error fetching provider');
    });

    test('should handle database errors on update', async () => {
      const mockProvider = {
        provider_id: 1,
        update: jest.fn().mockRejectedValue(new Error('Update failed'))
      };

      const { Provider } = require('../../models');
      Provider.findByPk.mockResolvedValue(mockProvider);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/providers', providersRoutes);

      const response = await request(authedApp)
        .put('/providers/1')
        .send({
          username: 'updatedprovider'
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error updating provider');
    });

    test('should handle database errors on delete', async () => {
      const mockProvider = {
        provider_id: 1,
        destroy: jest.fn().mockRejectedValue(new Error('Delete failed'))
      };

      const { Provider } = require('../../models');
      Provider.findByPk.mockResolvedValue(mockProvider);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/providers', providersRoutes);

      const response = await request(authedApp)
        .delete('/providers/1');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error deleting provider');
    });

    test('should handle database errors on getSubstances', async () => {
      const error = new Error('Database error');
      const { Substance } = require('../../models');
      Substance.findAll.mockRejectedValue(error);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/providers', providersRoutes);

      const response = await request(authedApp)
        .get('/providers/1/substances');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error fetching substances');
    });

    test('should handle database errors on getTransportOptions', async () => {
      const error = new Error('Database error');
      const { ProviderTransport } = require('../../models');
      ProviderTransport.findAll.mockRejectedValue(error);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/providers', providersRoutes);

      const response = await request(authedApp)
        .get('/providers/1/transport-options');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error fetching transport options');
    });

    test('should handle database errors on getPurchaseOrders', async () => {
      const error = new Error('Database error');
      const { PurchaseOrder } = require('../../models');
      PurchaseOrder.findAll.mockRejectedValue(error);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/providers', providersRoutes);

      const response = await request(authedApp)
        .get('/providers/1/purchase-orders');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error fetching purchase orders');
    });
  });
});