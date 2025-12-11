import request from 'supertest';
import express from 'express';
import inventoryRoutes from './inventory-routes';

// Mock dependencies
jest.mock('../../models', () => ({
  Inventory: {
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn()
  },
  Substance: {},
  Provider: {},
  Dealer: {},
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

describe('Inventory Routes Integration Tests', () => {
  let app: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/inventory', inventoryRoutes);
    jest.clearAllMocks();
  });

  describe('POST /inventory', () => {
    test('should create inventory item for dealer', async () => {
      const { Inventory } = require('../../models');
      Inventory.findOne.mockResolvedValue(null);
      Inventory.create.mockResolvedValue({
        inventory_id: 10,
        toJSON: () => ({ inventory_id: 10 })
      });
      Inventory.findByPk.mockResolvedValue({
        inventory_id: 10,
        substance: { substance_id: 5 }
      });

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/inventory', inventoryRoutes);

      const response = await request(authedApp)
        .post('/inventory')
        .send({
          substance_id: 5,
          quantity: 100,
          reorderLevel: 20
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Inventory item created successfully');
      expect(Inventory.create).toHaveBeenCalledWith({
        dealer_id: 1,
        substance_id: 5,
        quantity: 100,
        reorderLevel: 20
      });
    });

    test('should return 403 for non-dealer users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/inventory', inventoryRoutes);

      const response = await request(authedApp)
        .post('/inventory')
        .send({
          substance_id: 5,
          quantity: 100
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    test('should validate required fields', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/inventory', inventoryRoutes);

      const response = await request(authedApp)
        .post('/inventory')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing required fields: substance_id, quantity');
    });
  });

  describe('GET /inventory', () => {
    test('should fetch all inventory with authentication', async () => {
      const mockInventory = [
        {
          toJSON: () => ({
            inventory_id: 10,
            substance_id: 5,
            substance: {
              substance_id: 5,
              provider: { provider_id: 3 }
            },
            dealer: { dealer_id: 1 }
          })
        }
      ];

      const { Inventory } = require('../../models');
      Inventory.findAll.mockResolvedValue(mockInventory);

      const { getImageUrl } = require('../file-upload/upload-middleware');
      getImageUrl.mockReturnValue('http://example.com/image.jpg');

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/inventory', inventoryRoutes);

      const response = await request(authedApp)
        .get('/inventory');

      expect(response.status).toBe(200);
      expect(response.body.inventory).toBeDefined();
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/inventory');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('GET /inventory/:id', () => {
    test('should fetch inventory item by ID', async () => {
      const mockInventory = {
        inventory_id: 10,
        toJSON: () => ({
          inventory_id: 10,
          substance_id: 5,
          substance: {
            substance_id: 5,
            provider: { provider_id: 3 }
          },
          dealer: { dealer_id: 1 }
        })
      };

      const { Inventory } = require('../../models');
      Inventory.findByPk.mockResolvedValue(mockInventory);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/inventory', inventoryRoutes);

      const response = await request(authedApp)
        .get('/inventory/10');

      expect(response.status).toBe(200);
      expect(response.body.inventory.inventory_id).toBe(10);
    });

    test('should return 404 when inventory not found', async () => {
      const { Inventory } = require('../../models');
      Inventory.findByPk.mockResolvedValue(null);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/inventory', inventoryRoutes);

      const response = await request(authedApp)
        .get('/inventory/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Inventory item not found');
    });
  });

  describe('PUT /inventory/:id', () => {
    test('should update inventory item for owner dealer', async () => {
      const mockInventory = {
        dealer_id: 1,
        update: jest.fn().mockResolvedValue(true),
        toJSON: () => ({ inventory_id: 10 })
      };

      const { Inventory } = require('../../models');
      Inventory.findByPk
        .mockResolvedValueOnce(mockInventory)
        .mockResolvedValueOnce({ inventory_id: 10 });

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/inventory', inventoryRoutes);

      const response = await request(authedApp)
        .put('/inventory/10')
        .send({ quantity: 150 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Inventory item updated successfully');
      expect(mockInventory.update).toHaveBeenCalledWith({ quantity: 150 });
    });

    test('should return 403 when updating other dealer inventory', async () => {
      const mockInventory = {
        dealer_id: 2 // Different dealer
      };

      const { Inventory } = require('../../models');
      Inventory.findByPk.mockResolvedValue(mockInventory);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/inventory', inventoryRoutes);

      const response = await request(authedApp)
        .put('/inventory/10')
        .send({ quantity: 150 });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot update other dealers inventory');
    });
  });

  describe('DELETE /inventory/:id', () => {
    test('should delete inventory item for owner dealer', async () => {
      const mockInventory = {
        dealer_id: 1,
        destroy: jest.fn().mockResolvedValue(true)
      };

      const { Inventory } = require('../../models');
      Inventory.findByPk.mockResolvedValue(mockInventory);

      const { deleteImageById } = require('../file-upload/upload-middleware');

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/inventory', inventoryRoutes);

      const response = await request(authedApp)
        .delete('/inventory/10');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Inventory item deleted successfully');
      expect(deleteImageById).toHaveBeenCalledWith('inventory', 10);
      expect(mockInventory.destroy).toHaveBeenCalled();
    });

    test('should return 404 when inventory not found', async () => {
      const { Inventory } = require('../../models');
      Inventory.findByPk.mockResolvedValue(null);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/inventory', inventoryRoutes);

      const response = await request(authedApp)
        .delete('/inventory/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Inventory item not found');
    });
  });
});