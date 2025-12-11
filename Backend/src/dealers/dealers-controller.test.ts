import request from 'supertest';
import express from 'express';
import dealersRoutes from './dealers-routes';

// Mock dependencies
jest.mock('../../models', () => ({
  Dealer: {
    findByPk: jest.fn(),
    create: jest.fn()
  },
  Inventory: {
    findAll: jest.fn()
  },
  Order: {
    findAll: jest.fn()
  },
  PurchaseOrder: {
    findAll: jest.fn()
  },
  Customer: {},
  OrderItem: {},
  Substance: {},
  Provider: {},
  Shipment: {},
  sequelize: {
    query: jest.fn()
  }
}));

jest.mock('../utils/utils', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed_password'),
  comparePassword: jest.fn()
}));

// Mock auth middleware
jest.mock('../auth/auth-middleware', () => ({
  authenticate: (allowedTypes: string[]) => {
    return (req: any, res: any, next: any) => {
      if (!req.user || !allowedTypes.includes(req.user.type)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      next();
    };
  }
}));

describe('Dealer Routes Integration Tests', () => {
  let app: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('api/', dealersRoutes);
    jest.clearAllMocks();
  });

  describe('GET /dealers/:id', () => {
    test('should return dealer profile when authenticated', async () => {
      const mockDealer = {
        dealer_id: 1,
        username: 'testdealer',
        email: 'dealer@example.com',
        rating: 4.5
      };

      const { Dealer } = require('../../models');
      Dealer.findByPk.mockResolvedValue(mockDealer);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/dealers', dealersRoutes);

      const response = await request(authedApp)
        .get('/dealers/1');

      expect(response.status).toBe(200);
      expect(response.body.dealer).toEqual(mockDealer);
    });

    test('should return 403 for non-dealer users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' }; // Wrong user type
        next();
      });
      authedApp.use('/dealers', dealersRoutes);

      const response = await request(authedApp)
        .get('/dealers/1');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    test('should return 403 when accessing other dealer profile', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 2, type: 'dealer' }; // Different dealer ID
        next();
      });
      authedApp.use('/dealers', dealersRoutes);

      const response = await request(authedApp)
        .get('/dealers/1');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot access other profiles');
    });
  });

  describe('GET /dealers/:id/inventory', () => {
    test('should get dealer inventory successfully', async () => {
      const mockInventory = [
        {
          inventory_id: 1,
          dealer_id: 1,
          substance_id: 5,
          quantity: 50,
          substance: {
            substance_id: 5,
            name: 'Premium Coffee',
            provider: {
              provider_id: 3,
              businessName: 'Substance Source Co.'
            }
          }
        }
      ];

      const { Inventory } = require('../../models');
      Inventory.findAll.mockResolvedValue(mockInventory);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/dealers', dealersRoutes);

      const response = await request(authedApp)
        .get('/dealers/1/inventory');

      expect(response.status).toBe(200);
      expect(response.body.inventory).toEqual(mockInventory);
      expect(Inventory.findAll).toHaveBeenCalledWith({
        where: { dealer_id: 1 },
        include: [
          {
            model: expect.anything(),
            as: 'substance',
            include: [
              {
                model: expect.anything(),
                as: 'provider',
                attributes: { exclude: ['password'] }
              }
            ]
          }
        ]
      });
    });

    test('should return empty array when no inventory', async () => {
      const { Inventory } = require('../../models');
      Inventory.findAll.mockResolvedValue([]);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/dealers', dealersRoutes);

      const response = await request(authedApp)
        .get('/dealers/1/inventory');

      expect(response.status).toBe(200);
      expect(response.body.inventory).toEqual([]);
    });

    test('should return 403 when accessing other dealer inventory', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 2, type: 'dealer' }; // Different dealer
        next();
      });
      authedApp.use('/dealers', dealersRoutes);

      const response = await request(authedApp)
        .get('/dealers/1/inventory');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot access other inventory');
    });
  });

  describe('GET /dealers/:id/orders', () => {
    test('should get dealer orders successfully', async () => {
      const mockOrders = [
        {
          order_id: 1,
          dealer_id: 1,
          customer: {
            customer_id: 100,
            username: 'john_doe'
          },
          items: [
            {
              substance: {
                name: 'Premium Coffee'
              }
            }
          ],
          shipment: {
            tracking_number: 'TRACK123456'
          }
        }
      ];

      const { Order } = require('../../models');
      Order.findAll.mockResolvedValue(mockOrders);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/dealers', dealersRoutes);

      const response = await request(authedApp)
        .get('/dealers/1/orders');

      expect(response.status).toBe(200);
      expect(response.body.orders).toEqual(mockOrders);
      expect(Order.findAll).toHaveBeenCalledWith({
        where: { dealer_id: 1 },
        include: [
          {
            model: expect.anything(),
            as: 'customer',
            attributes: { exclude: ['password'] }
          },
          {
            model: expect.anything(),
            as: 'items',
            include: [
              {
                model: expect.anything(),
                as: 'substance'
              }
            ]
          },
          {
            model: expect.anything(),
            as: 'shipment'
          }
        ]
      });
    });

    test('should return 403 when accessing other dealer orders', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 2, type: 'dealer' };
        next();
      });
      authedApp.use('/dealers', dealersRoutes);

      const response = await request(authedApp)
        .get('/dealers/1/orders');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot access other orders');
    });
  });

  describe('GET /dealers/:id/purchase-orders', () => {
    test('should get dealer purchase orders successfully', async () => {
      const mockPurchaseOrders = [
        {
          purchase_order_id: 1,
          dealer_id: 1,
          provider: {
            provider_id: 3,
            businessName: 'Test Provider'
          },
          items: [
            {
              substance: {
                name: 'Test Substance'
              }
            }
          ]
        }
      ];

      const { PurchaseOrder } = require('../../models');
      PurchaseOrder.findAll.mockResolvedValue(mockPurchaseOrders);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/dealers', dealersRoutes);

      const response = await request(authedApp)
        .get('/dealers/1/purchase-orders');

      expect(response.status).toBe(200);
      expect(response.body.purchaseOrders).toEqual(mockPurchaseOrders);
      expect(PurchaseOrder.findAll).toHaveBeenCalledWith({
        where: { dealer_id: 1 },
        include: [
          {
            model: expect.anything(),
            as: 'provider',
            attributes: { exclude: ['password'] }
          },
          {
            model: expect.anything(),
            as: 'items',
            include: [
              {
                model: expect.anything(),
                as: 'substance'
              }
            ]
          }
        ]
      });
    });

    test('should return empty array when no purchase orders', async () => {
      const { PurchaseOrder } = require('../../models');
      PurchaseOrder.findAll.mockResolvedValue([]);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/dealers', dealersRoutes);

      const response = await request(authedApp)
        .get('/dealers/1/purchase-orders');

      expect(response.status).toBe(200);
      expect(response.body.purchaseOrders).toEqual([]);
    });
  });

  describe('PUT /dealers/:id', () => {
    test('should update dealer successfully', async () => {
      const mockDealer = {
        update: jest.fn().mockResolvedValue(true),
        dealer_id: 1
      };
      const updatedDealer = {
        dealer_id: 1,
        username: 'updateddealer',
        email: 'updated@example.com'
      };

      const { Dealer } = require('../../models');
      Dealer.findByPk
        .mockResolvedValueOnce(mockDealer)
        .mockResolvedValueOnce(updatedDealer);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/dealers', dealersRoutes);

      const response = await request(authedApp)
        .put('/dealers/1')
        .send({ username: 'updateddealer', email: 'updated@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Dealer updated successfully');
    });

    test('should handle password update', async () => {
      const mockDealer = {
        update: jest.fn().mockResolvedValue(true),
        dealer_id: 1
      };
      const updatedDealer = { dealer_id: 1 };

      const { Dealer } = require('../../models');
      Dealer.findByPk
        .mockResolvedValueOnce(mockDealer)
        .mockResolvedValueOnce(updatedDealer);

      const { hashPassword } = require('../utils/utils');

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/dealers', dealersRoutes);

      const response = await request(authedApp)
        .put('/dealers/1')
        .send({ password: 'newpassword123' });

      expect(response.status).toBe(200);
      expect(hashPassword).toHaveBeenCalledWith('newpassword123');
    });
  });

  describe('DELETE /dealers/:id', () => {
    test('should delete dealer successfully', async () => {
      const mockDealer = {
        destroy: jest.fn().mockResolvedValue(true)
      };

      const { Dealer } = require('../../models');
      Dealer.findByPk.mockResolvedValue(mockDealer);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/dealers', dealersRoutes);

      const response = await request(authedApp)
        .delete('/dealers/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Dealer account deleted successfully');
    });

    test('should return 404 when dealer not found', async () => {
      const { Dealer } = require('../../models');
      Dealer.findByPk.mockResolvedValue(null);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/dealers', dealersRoutes);

      const response = await request(authedApp)
        .delete('/dealers/1');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Dealer not found');
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors', async () => {
      const { Dealer } = require('../../models');
      const error = new Error('Database connection failed');
      Dealer.findByPk.mockRejectedValue(error);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/dealers', dealersRoutes);

      const response = await request(authedApp)
        .get('/dealers/1');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error fetching dealer');
    });
  });
});