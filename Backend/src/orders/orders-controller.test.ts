import request from 'supertest';
import express from 'express';
import ordersRoutes from './orders-routes';

// Mock dependencies
jest.mock('../../models', () => ({
  Order: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn()
  },
  OrderItem: {
    create: jest.fn()
  },
  Dealer: {
    findByPk: jest.fn()
  },
  Substance: {
    findByPk: jest.fn()
  },
  Customer: {},
  Shipment: {},
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

describe('Orders Routes Integration Tests', () => {
  let app: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/orders', ordersRoutes);
    jest.clearAllMocks();
  });

  describe('POST /orders', () => {
    test('should create order successfully for customer', async () => {
      const mockDealer = {
        dealer_id: 2,
        username: 'testdealer'
      };

      const mockSubstance = {
        substance_id: 5,
        name: 'Test Substance'
      };

      const mockOrder = {
        order_id: 1,
        customer_id: 1,
        dealer_id: 2,
        totalAmount: 250.50,
        toJSON: jest.fn().mockReturnValue({
          order_id: 1,
          customer_id: 1,
          dealer_id: 2
        })
      };

      const { Dealer, Substance, Order, OrderItem } = require('../../models');
      
      Dealer.findByPk.mockResolvedValue(mockDealer);
      Substance.findByPk.mockResolvedValue(mockSubstance);
      Order.create.mockResolvedValue(mockOrder);
      Order.findByPk.mockResolvedValue({
        ...mockOrder,
        items: [{ substance: mockSubstance }],
        dealer: mockDealer,
        customer: { customer_id: 1 }
      });

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/orders', ordersRoutes);

      const response = await request(authedApp)
        .post('/orders')
        .send({
          dealer_id: 2,
          deliveryAddress: '123 Test St, Test City',
          paymentMethod: 'credit_card',
          shippingCost: 10.50,
          items: [
            {
              substance_id: 5,
              quantity: 2,
              unitPrice: 120.00
            }
          ]
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Order created successfully');
      expect(Order.create).toHaveBeenCalledWith({
        customer_id: 1,
        dealer_id: 2,
        totalAmount: 250.50,
        deliveryAddress: '123 Test St, Test City',
        paymentMethod: 'credit_card',
        paymentDate: expect.any(Date),
        shippingCost: 10.50,
        orderStatus: 'pending',
        paymentStatus: 'pending'
      });
      expect(OrderItem.create).toHaveBeenCalledWith({
        order_id: 1,
        substance_id: 5,
        quantity: 2,
        unitPrice: 120.00,
        subTotal: 240.00
      });
    });

    test('should return 403 for non-customer users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/orders', ordersRoutes);

      const response = await request(authedApp)
        .post('/orders')
        .send({
          dealer_id: 2,
          deliveryAddress: '123 Test St',
          paymentMethod: 'credit_card',
          items: [{ substance_id: 5, quantity: 1, unitPrice: 100 }]
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    test('should validate required fields', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/orders', ordersRoutes);

      const response = await request(authedApp)
        .post('/orders')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing required fields: dealer_id, items (array), deliveryAddress, paymentMethod');
    });

    test('should validate items array', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/orders', ordersRoutes);

      const response = await request(authedApp)
        .post('/orders')
        .send({
          dealer_id: 2,
          deliveryAddress: '123 Test St',
          paymentMethod: 'credit_card',
          items: []
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing required fields: dealer_id, items (array), deliveryAddress, paymentMethod');
    });

    test('should validate each item fields', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/orders', ordersRoutes);

      const response = await request(authedApp)
        .post('/orders')
        .send({
          dealer_id: 2,
          deliveryAddress: '123 Test St',
          paymentMethod: 'credit_card',
          items: [{ substance_id: 5 }] // Missing quantity and unitPrice
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Each item must have: substance_id, quantity, unitPrice');
    });

    test('should return 404 when dealer not found', async () => {
      const { Dealer } = require('../../models');
      Dealer.findByPk.mockResolvedValue(null);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/orders', ordersRoutes);

      const response = await request(authedApp)
        .post('/orders')
        .send({
          dealer_id: 999,
          deliveryAddress: '123 Test St',
          paymentMethod: 'credit_card',
          items: [{ substance_id: 5, quantity: 1, unitPrice: 100 }]
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Dealer not found');
    });

    test('should handle duplicate primary key retry', async () => {
      const { Dealer, Substance, Order, sequelize } = require('../../models');
      
      Dealer.findByPk.mockResolvedValue({ dealer_id: 2 });
      Substance.findByPk.mockResolvedValue({ substance_id: 5 });
      
      const duplicateError = {
        code: '23505',
        constraint: 'orders_pkey'
      };
      
      Order.create
        .mockRejectedValueOnce(duplicateError)
        .mockResolvedValueOnce({
          order_id: 1,
          customer_id: 1,
          dealer_id: 2
        });
      
      Order.findByPk.mockResolvedValue({
        order_id: 1,
        items: [],
        dealer: { dealer_id: 2 },
        customer: { customer_id: 1 }
      });
      
      sequelize.query.mockResolvedValue(true);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/orders', ordersRoutes);

      const response = await request(authedApp)
        .post('/orders')
        .send({
          dealer_id: 2,
          deliveryAddress: '123 Test St',
          paymentMethod: 'credit_card',
          items: [{ substance_id: 5, quantity: 1, unitPrice: 100 }]
        });

      expect(response.status).toBe(201);
      expect(sequelize.query).toHaveBeenCalledWith(
        "SELECT nextval('orders_order_id_seq')"
      );
    });
  });

  describe('GET /orders', () => {
    test('should fetch all orders with authentication', async () => {
      const mockOrders = [
        {
          order_id: 1,
          items: [],
          dealer: { dealer_id: 2 },
          customer: { customer_id: 1 },
          shipment: null
        }
      ];

      const { Order } = require('../../models');
      Order.findAll.mockResolvedValue(mockOrders);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/orders', ordersRoutes);

      const response = await request(authedApp)
        .get('/orders');

      expect(response.status).toBe(200);
      expect(response.body.orders).toEqual(mockOrders);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/orders');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('GET /orders/:id', () => {
    test('should fetch order by ID for any authenticated user', async () => {
      const mockOrder = {
        order_id: 1,
        items: [],
        dealer: { dealer_id: 2 },
        customer: { customer_id: 1 },
        shipment: null
      };

      const { Order } = require('../../models');
      Order.findByPk.mockResolvedValue(mockOrder);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/orders', ordersRoutes);

      const response = await request(authedApp)
        .get('/orders/1');

      expect(response.status).toBe(200);
      expect(response.body.order).toEqual(mockOrder);
    });

    test('should return 404 when order not found', async () => {
      const { Order } = require('../../models');
      Order.findByPk.mockResolvedValue(null);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/orders', ordersRoutes);

      const response = await request(authedApp)
        .get('/orders/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Order not found');
    });
  });

  describe('PUT /orders/:id', () => {
    test('should update order for owner customer', async () => {
      const mockOrder = {
        order_id: 1,
        customer_id: 1,
        dealer_id: 2,
        update: jest.fn().mockResolvedValue(true)
      };

      const { Order } = require('../../models');
      Order.findByPk
        .mockResolvedValueOnce(mockOrder)
        .mockResolvedValueOnce({
          ...mockOrder,
          items: [],
          dealer: { dealer_id: 2 },
          customer: { customer_id: 1 }
        });

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/orders', ordersRoutes);

      const response = await request(authedApp)
        .put('/orders/1')
        .send({ orderStatus: 'processing' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Order updated successfully');
      expect(mockOrder.update).toHaveBeenCalledWith({ orderStatus: 'processing' });
    });

    test('should update order for owner dealer', async () => {
      const mockOrder = {
        order_id: 1,
        customer_id: 100,
        dealer_id: 2,
        update: jest.fn().mockResolvedValue(true)
      };

      const { Order } = require('../../models');
      Order.findByPk
        .mockResolvedValueOnce(mockOrder)
        .mockResolvedValueOnce({
          ...mockOrder,
          items: [],
          dealer: { dealer_id: 2 },
          customer: { customer_id: 100 }
        });

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 2, type: 'dealer' };
        next();
      });
      authedApp.use('/orders', ordersRoutes);

      const response = await request(authedApp)
        .put('/orders/1')
        .send({ orderStatus: 'shipped' });

      expect(response.status).toBe(200);
      expect(mockOrder.update).toHaveBeenCalledWith({ orderStatus: 'shipped' });
    });

    test('should return 403 when customer updates other customer order', async () => {
      const mockOrder = {
        order_id: 1,
        customer_id: 999, // Different customer
        dealer_id: 2
      };

      const { Order } = require('../../models');
      Order.findByPk.mockResolvedValue(mockOrder);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/orders', ordersRoutes);

      const response = await request(authedApp)
        .put('/orders/1')
        .send({ orderStatus: 'processing' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot update other customers orders');
    });

    test('should return 403 when dealer updates other dealer order', async () => {
      const mockOrder = {
        order_id: 1,
        customer_id: 100,
        dealer_id: 999 // Different dealer
      };

      const { Order } = require('../../models');
      Order.findByPk.mockResolvedValue(mockOrder);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/orders', ordersRoutes);

      const response = await request(authedApp)
        .put('/orders/1')
        .send({ orderStatus: 'shipped' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot update orders for other dealers');
    });

    test('should return 403 for non-customer/dealer users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'provider' }; // Provider not allowed
        next();
      });
      authedApp.use('/orders', ordersRoutes);

      const response = await request(authedApp)
        .put('/orders/1')
        .send({ orderStatus: 'processing' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });
  });

  describe('DELETE /orders/:id', () => {
    test('should delete pending order for owner customer', async () => {
      const mockOrder = {
        order_id: 1,
        customer_id: 1,
        orderStatus: 'pending',
        destroy: jest.fn().mockResolvedValue(true)
      };

      const { Order } = require('../../models');
      Order.findByPk.mockResolvedValue(mockOrder);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/orders', ordersRoutes);

      const response = await request(authedApp)
        .delete('/orders/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Order deleted successfully');
      expect(mockOrder.destroy).toHaveBeenCalled();
    });

    test('should return 403 for non-customer users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/orders', ordersRoutes);

      const response = await request(authedApp)
        .delete('/orders/1');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    test('should return 403 when deleting other customer order', async () => {
      const mockOrder = {
        order_id: 1,
        customer_id: 999, // Different customer
        orderStatus: 'pending'
      };

      const { Order } = require('../../models');
      Order.findByPk.mockResolvedValue(mockOrder);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/orders', ordersRoutes);

      const response = await request(authedApp)
        .delete('/orders/1');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot delete other customers orders');
    });

    test('should prevent deletion of non-pending orders', async () => {
      const mockOrder = {
        order_id: 1,
        customer_id: 1,
        orderStatus: 'completed' // Not pending
      };

      const { Order } = require('../../models');
      Order.findByPk.mockResolvedValue(mockOrder);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/orders', ordersRoutes);

      const response = await request(authedApp)
        .delete('/orders/1');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Cannot delete orders that are not pending');
    });

    test('should return 404 when order not found', async () => {
      const { Order } = require('../../models');
      Order.findByPk.mockResolvedValue(null);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/orders', ordersRoutes);

      const response = await request(authedApp)
        .delete('/orders/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Order not found');
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors on create', async () => {
      const { Dealer, Substance } = require('../../models');
      Dealer.findByPk.mockResolvedValue({ dealer_id: 2 });
      Substance.findByPk.mockResolvedValue({ substance_id: 5 });

      const error = new Error('Database connection failed');
      const { Order } = require('../../models');
      Order.create.mockRejectedValue(error);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/orders', ordersRoutes);

      const response = await request(authedApp)
        .post('/orders')
        .send({
          dealer_id: 2,
          deliveryAddress: '123 Test St',
          paymentMethod: 'credit_card',
          items: [{ substance_id: 5, quantity: 1, unitPrice: 100 }]
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error creating order');
    });

    test('should handle database errors on fetch', async () => {
      const error = new Error('Database error');
      const { Order } = require('../../models');
      Order.findAll.mockRejectedValue(error);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/orders', ordersRoutes);

      const response = await request(authedApp)
        .get('/orders');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error fetching orders');
    });
  });
});