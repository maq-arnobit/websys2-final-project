import request from 'supertest';
import express from 'express';
import purchaseOrdersRoutes from './purchase-orders-routes';

// Mock dependencies
jest.mock('../../models', () => ({
  PurchaseOrder: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn()
  },
  ProviderTransport: {
    findByPk: jest.fn()
  },
  Dealer: {},
  Provider: {},
  Substance: {},
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

describe('Purchase Orders Routes Integration Tests', () => {
  let app: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/purchase-orders', purchaseOrdersRoutes);
    jest.clearAllMocks();
  });

  describe('POST /purchase-orders', () => {
    test('should create purchase order successfully for dealer', async () => {
      const mockTransport = {
        transport_id: 3,
        provider_id: 2,
        transportCost: 50.00,
        transportMethod: 'express'
      };

      const mockPurchaseOrder = {
        purchaseOrder_id: 1,
        dealer_id: 1,
        provider_id: 2,
        substance_id: 5,
        providerTransport_id: 3,
        quantityOrdered: 10,
        unitCost: 25.50,
        transportCost: 50.00,
        totalCost: 305.00,
        paymentMethod: 'bank_transfer',
        toJSON: jest.fn().mockReturnValue({
          purchaseOrder_id: 1,
          dealer_id: 1,
          totalCost: 305.00
        })
      };

      const completePurchaseOrder = {
        purchaseOrder_id: 1,
        dealer: { dealer_id: 1 },
        provider: { provider_id: 2 },
        substance: { substance_id: 5 },
        transport: { transport_id: 3 }
      };

      const { ProviderTransport, PurchaseOrder } = require('../../models');
      
      ProviderTransport.findByPk.mockResolvedValue(mockTransport);
      PurchaseOrder.create.mockResolvedValue(mockPurchaseOrder);
      PurchaseOrder.findByPk.mockResolvedValue(completePurchaseOrder);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/purchase-orders', purchaseOrdersRoutes);

      const response = await request(authedApp)
        .post('/purchase-orders')
        .send({
          provider_id: 2,
          substance_id: 5,
          providerTransport_id: 3,
          quantityOrdered: 10,
          unitCost: 25.50,
          paymentMethod: 'bank_transfer'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Purchase order created successfully');
      expect(PurchaseOrder.create).toHaveBeenCalledWith({
        dealer_id: 1,
        provider_id: 2,
        substance_id: 5,
        providerTransport_id: 3,
        quantityOrdered: 10,
        unitCost: 25.50,
        transportCost: 50.00,
        totalCost: 305.00,
        paymentMethod: 'bank_transfer',
        paymentDate: expect.any(Date),
        status: 'pending'
      });
    });

    test('should return 403 for non-dealer users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/purchase-orders', purchaseOrdersRoutes);

      const response = await request(authedApp)
        .post('/purchase-orders')
        .send({
          provider_id: 2,
          substance_id: 5,
          providerTransport_id: 3,
          quantityOrdered: 10,
          unitCost: 25.50,
          paymentMethod: 'bank_transfer'
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    test('should validate all required fields', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/purchase-orders', purchaseOrdersRoutes);

      const response = await request(authedApp)
        .post('/purchase-orders')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing required fields: provider_id, substance_id, providerTransport_id, quantityOrdered, unitCost, paymentMethod');
    });

    test('should return 404 when transport not found', async () => {
      const { ProviderTransport } = require('../../models');
      ProviderTransport.findByPk.mockResolvedValue(null);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/purchase-orders', purchaseOrdersRoutes);

      const response = await request(authedApp)
        .post('/purchase-orders')
        .send({
          provider_id: 2,
          substance_id: 5,
          providerTransport_id: 999,
          quantityOrdered: 10,
          unitCost: 25.50,
          paymentMethod: 'bank_transfer'
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Transport option not found');
    });

    test('should validate transport belongs to provider', async () => {
      const mockTransport = {
        transport_id: 3,
        provider_id: 999 // Different from requested provider
      };

      const { ProviderTransport } = require('../../models');
      ProviderTransport.findByPk.mockResolvedValue(mockTransport);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/purchase-orders', purchaseOrdersRoutes);

      const response = await request(authedApp)
        .post('/purchase-orders')
        .send({
          provider_id: 2,
          substance_id: 5,
          providerTransport_id: 3,
          quantityOrdered: 10,
          unitCost: 25.50,
          paymentMethod: 'bank_transfer'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Transport option does not belong to the specified provider');
    });

    test('should calculate total cost correctly', async () => {
      const mockTransport = {
        transport_id: 3,
        provider_id: 2,
        transportCost: 50.00
      };

      const mockPurchaseOrder = {
        purchaseOrder_id: 1,
        toJSON: jest.fn().mockReturnValue({ purchaseOrder_id: 1 })
      };

      const { ProviderTransport, PurchaseOrder } = require('../../models');
      
      ProviderTransport.findByPk.mockResolvedValue(mockTransport);
      PurchaseOrder.create.mockResolvedValue(mockPurchaseOrder);
      PurchaseOrder.findByPk.mockResolvedValue({ purchaseOrder_id: 1 });

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/purchase-orders', purchaseOrdersRoutes);

      const response = await request(authedApp)
        .post('/purchase-orders')
        .send({
          provider_id: 2,
          substance_id: 5,
          providerTransport_id: 3,
          quantityOrdered: '10',
          unitCost: '25.50',
          paymentMethod: 'bank_transfer'
        });

      expect(response.status).toBe(201);
      expect(PurchaseOrder.create).toHaveBeenCalledWith(expect.objectContaining({
        quantityOrdered: 10,
        unitCost: 25.50,
        transportCost: 50.00,
        totalCost: 305.00 // (10 * 25.50) + 50.00 = 305.00
      }));
    });

    test('should handle duplicate primary key retry', async () => {
      const { ProviderTransport, PurchaseOrder, sequelize } = require('../../models');
      
      ProviderTransport.findByPk.mockResolvedValue({
        transport_id: 3,
        provider_id: 2,
        transportCost: 50.00
      });
      
      const duplicateError = {
        code: '23505',
        constraint: 'purchase_orders_pkey'
      };
      
      PurchaseOrder.create
        .mockRejectedValueOnce(duplicateError)
        .mockResolvedValueOnce({ purchaseOrder_id: 1 });
      
      PurchaseOrder.findByPk.mockResolvedValue({ purchaseOrder_id: 1 });
      sequelize.query.mockResolvedValue(true);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/purchase-orders', purchaseOrdersRoutes);

      const response = await request(authedApp)
        .post('/purchase-orders')
        .send({
          provider_id: 2,
          substance_id: 5,
          providerTransport_id: 3,
          quantityOrdered: 10,
          unitCost: 25.50,
          paymentMethod: 'bank_transfer'
        });

      expect(response.status).toBe(201);
      expect(sequelize.query).toHaveBeenCalledWith(
        "SELECT nextval('purchase_orders_purchaseorder_id_seq')"
      );
    });
  });

  describe('GET /purchase-orders', () => {
    test('should fetch all purchase orders with authentication', async () => {
      const mockPurchaseOrders = [
        {
          purchaseOrder_id: 1,
          dealer: { dealer_id: 1 },
          provider: { provider_id: 2 },
          substance: { substance_id: 5 },
          transport: { transport_id: 3 }
        }
      ];

      const { PurchaseOrder } = require('../../models');
      PurchaseOrder.findAll.mockResolvedValue(mockPurchaseOrders);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/purchase-orders', purchaseOrdersRoutes);

      const response = await request(authedApp)
        .get('/purchase-orders');

      expect(response.status).toBe(200);
      expect(response.body.purchaseOrders).toEqual(mockPurchaseOrders);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/purchase-orders');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('GET /purchase-orders/:id', () => {
    test('should fetch purchase order by ID for any authenticated user', async () => {
      const mockPurchaseOrder = {
        purchaseOrder_id: 1,
        dealer: { dealer_id: 1 },
        provider: { provider_id: 2 },
        substance: { substance_id: 5 },
        transport: { transport_id: 3 }
      };

      const { PurchaseOrder } = require('../../models');
      PurchaseOrder.findByPk.mockResolvedValue(mockPurchaseOrder);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/purchase-orders', purchaseOrdersRoutes);

      const response = await request(authedApp)
        .get('/purchase-orders/1');

      expect(response.status).toBe(200);
      expect(response.body.purchaseOrder).toEqual(mockPurchaseOrder);
    });

    test('should return 404 when purchase order not found', async () => {
      const { PurchaseOrder } = require('../../models');
      PurchaseOrder.findByPk.mockResolvedValue(null);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/purchase-orders', purchaseOrdersRoutes);

      const response = await request(authedApp)
        .get('/purchase-orders/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Purchase order not found');
    });
  });

  describe('PUT /purchase-orders/:id', () => {
    test('should update purchase order for owner dealer', async () => {
      const mockPurchaseOrder = {
        purchaseOrder_id: 1,
        dealer_id: 1,
        provider_id: 2,
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          purchaseOrder_id: 1,
          status: 'shipped'
        })
      };

      const { PurchaseOrder } = require('../../models');
      PurchaseOrder.findByPk.mockResolvedValue(mockPurchaseOrder);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/purchase-orders', purchaseOrdersRoutes);

      const response = await request(authedApp)
        .put('/purchase-orders/1')
        .send({ status: 'shipped' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Purchase order updated successfully');
      expect(mockPurchaseOrder.update).toHaveBeenCalledWith({ status: 'shipped' });
    });

    test('should update purchase order for owner provider', async () => {
      const mockPurchaseOrder = {
        purchaseOrder_id: 1,
        dealer_id: 100,
        provider_id: 2,
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          purchaseOrder_id: 1,
          status: 'completed'
        })
      };

      const { PurchaseOrder } = require('../../models');
      PurchaseOrder.findByPk.mockResolvedValue(mockPurchaseOrder);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 2, type: 'provider' };
        next();
      });
      authedApp.use('/purchase-orders', purchaseOrdersRoutes);

      const response = await request(authedApp)
        .put('/purchase-orders/1')
        .send({ status: 'completed' });

      expect(response.status).toBe(200);
      expect(mockPurchaseOrder.update).toHaveBeenCalledWith({ status: 'completed' });
    });

    test('should return 403 when dealer updates other dealer purchase order', async () => {
      const mockPurchaseOrder = {
        purchaseOrder_id: 1,
        dealer_id: 999, // Different dealer
        provider_id: 2
      };

      const { PurchaseOrder } = require('../../models');
      PurchaseOrder.findByPk.mockResolvedValue(mockPurchaseOrder);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/purchase-orders', purchaseOrdersRoutes);

      const response = await request(authedApp)
        .put('/purchase-orders/1')
        .send({ status: 'shipped' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot update other dealers purchase orders');
    });

    test('should return 403 when provider updates other provider purchase order', async () => {
      const mockPurchaseOrder = {
        purchaseOrder_id: 1,
        dealer_id: 1,
        provider_id: 999 // Different provider
      };

      const { PurchaseOrder } = require('../../models');
      PurchaseOrder.findByPk.mockResolvedValue(mockPurchaseOrder);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 2, type: 'provider' };
        next();
      });
      authedApp.use('/purchase-orders', purchaseOrdersRoutes);

      const response = await request(authedApp)
        .put('/purchase-orders/1')
        .send({ status: 'completed' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot update purchase orders for other providers');
    });

    test('should return 403 for non-dealer/provider users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/purchase-orders', purchaseOrdersRoutes);

      const response = await request(authedApp)
        .put('/purchase-orders/1')
        .send({ status: 'shipped' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });
  });

  describe('DELETE /purchase-orders/:id', () => {
    test('should delete purchase order for owner dealer', async () => {
      const mockPurchaseOrder = {
        purchaseOrder_id: 1,
        dealer_id: 1,
        destroy: jest.fn().mockResolvedValue(true)
      };

      const { PurchaseOrder } = require('../../models');
      PurchaseOrder.findByPk.mockResolvedValue(mockPurchaseOrder);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/purchase-orders', purchaseOrdersRoutes);

      const response = await request(authedApp)
        .delete('/purchase-orders/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Purchase order deleted successfully');
      expect(mockPurchaseOrder.destroy).toHaveBeenCalled();
    });

    test('should return 403 for non-dealer users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' };
        next();
      });
      authedApp.use('/purchase-orders', purchaseOrdersRoutes);

      const response = await request(authedApp)
        .delete('/purchase-orders/1');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    test('should return 403 when dealer deletes other dealer purchase order', async () => {
      const mockPurchaseOrder = {
        purchaseOrder_id: 1,
        dealer_id: 999 // Different dealer
      };

      const { PurchaseOrder } = require('../../models');
      PurchaseOrder.findByPk.mockResolvedValue(mockPurchaseOrder);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/purchase-orders', purchaseOrdersRoutes);

      const response = await request(authedApp)
        .delete('/purchase-orders/1');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot delete other dealers purchase orders');
    });

    test('should return 404 when purchase order not found', async () => {
      const { PurchaseOrder } = require('../../models');
      PurchaseOrder.findByPk.mockResolvedValue(null);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/purchase-orders', purchaseOrdersRoutes);

      const response = await request(authedApp)
        .delete('/purchase-orders/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Purchase order not found');
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors on create', async () => {
      const { ProviderTransport, PurchaseOrder } = require('../../models');
      
      ProviderTransport.findByPk.mockResolvedValue({
        transport_id: 3,
        provider_id: 2,
        transportCost: 50.00
      });
      
      const error = new Error('Database connection failed');
      PurchaseOrder.create.mockRejectedValue(error);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/purchase-orders', purchaseOrdersRoutes);

      const response = await request(authedApp)
        .post('/purchase-orders')
        .send({
          provider_id: 2,
          substance_id: 5,
          providerTransport_id: 3,
          quantityOrdered: 10,
          unitCost: 25.50,
          paymentMethod: 'bank_transfer'
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error creating purchase order');
    });

    test('should handle database errors on fetch all', async () => {
      const error = new Error('Database error');
      const { PurchaseOrder } = require('../../models');
      PurchaseOrder.findAll.mockRejectedValue(error);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/purchase-orders', purchaseOrdersRoutes);

      const response = await request(authedApp)
        .get('/purchase-orders');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error fetching purchase orders');
    });

    test('should handle database errors on update', async () => {
      const mockPurchaseOrder = {
        purchaseOrder_id: 1,
        dealer_id: 1,
        provider_id: 2,
        update: jest.fn().mockRejectedValue(new Error('Update failed'))
      };

      const { PurchaseOrder } = require('../../models');
      PurchaseOrder.findByPk.mockResolvedValue(mockPurchaseOrder);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/purchase-orders', purchaseOrdersRoutes);

      const response = await request(authedApp)
        .put('/purchase-orders/1')
        .send({ status: 'shipped' });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error updating purchase order');
    });
  });
});