import request from 'supertest';
import express from 'express';
import orderItemsRoutes from './order-items-routes';

// Mock dependencies
jest.mock('../../models', () => ({
  OrderItem: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn()
  },
  Order: {
    findByPk: jest.fn(),
    update: jest.fn()
  },
  Substance: {
    findByPk: jest.fn()
  },
  Customer: {},
  Dealer: {},
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

describe('Order Items Routes Integration Tests', () => {
  let app: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/order-items', orderItemsRoutes);
    jest.clearAllMocks();
  });

  describe('POST /order-items', () => {
    test('should create order item for customer', async () => {
      const mockOrder = {
        order_id: 1,
        customer_id: 1,
        orderStatus: 'pending',
        update: jest.fn().mockResolvedValue(true)
      };

      const mockSubstance = {
        substance_id: 5,
        name: 'Test Substance'
      };

      const mockOrderItem = {
        orderItem_id: 10,
        order_id: 1,
        substance_id: 5,
        quantity: 2,
        unitPrice: 25.50,
        subTotal: 51.00,
        toJSON: jest.fn().mockReturnValue({
          orderItem_id: 10,
          order_id: 1,
          substance_id: 5
        })
      };

      const { Order, Substance, OrderItem } = require('../../models');
      
      Order.findByPk.mockResolvedValue(mockOrder);
      Substance.findByPk.mockResolvedValue(mockSubstance);
      OrderItem.create.mockResolvedValue(mockOrderItem);
      OrderItem.findAll.mockResolvedValue([mockOrderItem]);
      OrderItem.findByPk.mockResolvedValue({
        ...mockOrderItem,
        order: mockOrder,
        substance: mockSubstance
      });

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/order-items', orderItemsRoutes);

      const response = await request(authedApp)
        .post('/order-items')
        .send({
          order_id: 1,
          substance_id: 5,
          quantity: 2,
          unitPrice: 25.50
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Order item created successfully');
      expect(OrderItem.create).toHaveBeenCalledWith({
        order_id: 1,
        substance_id: 5,
        quantity: 2,
        unitPrice: 25.50,
        subTotal: 51.00
      });
    });

    test('should return 403 for non-customer users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/order-items', orderItemsRoutes);

      const response = await request(authedApp)
        .post('/order-items')
        .send({
          order_id: 1,
          substance_id: 5,
          quantity: 2,
          unitPrice: 25.50
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
      authedApp.use('/order-items', orderItemsRoutes);

      const response = await request(authedApp)
        .post('/order-items')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing required fields: order_id, substance_id, quantity, unitPrice');
    });

    test('should prevent adding items to non-pending orders', async () => {
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
      authedApp.use('/order-items', orderItemsRoutes);

      const response = await request(authedApp)
        .post('/order-items')
        .send({
          order_id: 1,
          substance_id: 5,
          quantity: 2,
          unitPrice: 25.50
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Cannot add items to orders that are not pending');
    });
  });

  describe('GET /order-items', () => {
    test('should fetch all order items with authentication', async () => {
      const mockOrderItems = [
        {
          orderItem_id: 10,
          order: {
            customer: { customer_id: 1 },
            dealer: { dealer_id: 2 }
          },
          substance: {
            provider: { provider_id: 3 }
          }
        }
      ];

      const { OrderItem } = require('../../models');
      OrderItem.findAll.mockResolvedValue(mockOrderItems);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/order-items', orderItemsRoutes);

      const response = await request(authedApp)
        .get('/order-items');

      expect(response.status).toBe(200);
      expect(response.body.orderItems).toEqual(mockOrderItems);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/order-items');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('GET /order-items/:id', () => {
    test('should fetch order item by ID for owner customer', async () => {
      const mockOrderItem = {
        orderItem_id: 10,
        order: {
          customer_id: 1,
          dealer_id: 2
        }
      };

      const { OrderItem } = require('../../models');
      OrderItem.findByPk.mockResolvedValue(mockOrderItem);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/order-items', orderItemsRoutes);

      const response = await request(authedApp)
        .get('/order-items/10');

      expect(response.status).toBe(200);
      expect(response.body.orderItem).toEqual(mockOrderItem);
    });

    test('should fetch order item by ID for owner dealer', async () => {
      const mockOrderItem = {
        orderItem_id: 10,
        order: {
          customer_id: 100,
          dealer_id: 2
        }
      };

      const { OrderItem } = require('../../models');
      OrderItem.findByPk.mockResolvedValue(mockOrderItem);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 2, type: 'dealer' };
        next();
      });
      authedApp.use('/order-items', orderItemsRoutes);

      const response = await request(authedApp)
        .get('/order-items/10');

      expect(response.status).toBe(200);
      expect(response.body.orderItem).toEqual(mockOrderItem);
    });

    test('should return 403 when customer accesses other customer order item', async () => {
      const mockOrderItem = {
        orderItem_id: 10,
        order: {
          customer_id: 999, // Different customer
          dealer_id: 2
        }
      };

      const { OrderItem } = require('../../models');
      OrderItem.findByPk.mockResolvedValue(mockOrderItem);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/order-items', orderItemsRoutes);

      const response = await request(authedApp)
        .get('/order-items/10');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot access other customers order items');
    });

    test('should return 404 when order item not found', async () => {
      const { OrderItem } = require('../../models');
      OrderItem.findByPk.mockResolvedValue(null);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/order-items', orderItemsRoutes);

      const response = await request(authedApp)
        .get('/order-items/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Order item not found');
    });
  });

  describe('GET /order-items/order/:orderId', () => {
    test('should fetch order items by order ID for owner customer', async () => {
      const mockOrder = {
        order_id: 1,
        customer_id: 1,
        dealer_id: 2
      };

      const mockOrderItems = [
        {
          orderItem_id: 10,
          order_id: 1
        }
      ];

      const { Order, OrderItem } = require('../../models');
      Order.findByPk.mockResolvedValue(mockOrder);
      OrderItem.findAll.mockResolvedValue(mockOrderItems);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/order-items', orderItemsRoutes);

      const response = await request(authedApp)
        .get('/order-items/order/1');

      expect(response.status).toBe(200);
      expect(response.body.orderItems).toEqual(mockOrderItems);
      expect(OrderItem.findAll).toHaveBeenCalledWith({
        where: { order_id: 1 },
        include: expect.any(Array)
      });
    });

    test('should return 403 when accessing other customer order items', async () => {
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
      authedApp.use('/order-items', orderItemsRoutes);

      const response = await request(authedApp)
        .get('/order-items/order/1');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot access other customers order items');
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
      authedApp.use('/order-items', orderItemsRoutes);

      const response = await request(authedApp)
        .get('/order-items/order/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Order not found');
    });
  });

  describe('PUT /order-items/:id', () => {
    test('should update order item for owner customer', async () => {
      const mockOrder = {
        order_id: 1,
        customer_id: 1,
        orderStatus: 'pending',
        update: jest.fn().mockResolvedValue(true)
      };

      const mockOrderItem = {
        orderItem_id: 10,
        order_id: 1,
        quantity: 2,
        unitPrice: 25.50,
        subTotal: 51.00,
        order: mockOrder,
        update: jest.fn().mockResolvedValue(true)
      };

      const { OrderItem, Order } = require('../../models');
      
      OrderItem.findByPk
        .mockResolvedValueOnce(mockOrderItem)
        .mockResolvedValueOnce({
          ...mockOrderItem,
          order: mockOrder,
          substance: { substance_id: 5 }
        });

      OrderItem.findAll.mockResolvedValue([{ ...mockOrderItem, subTotal: 102.00 }]);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/order-items', orderItemsRoutes);

      const response = await request(authedApp)
        .put('/order-items/10')
        .send({ quantity: 4 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Order item updated successfully');
      expect(mockOrderItem.update).toHaveBeenCalledWith({
        quantity: 4,
        subTotal: 102.00
      });
    });

    test('should return 403 for non-customer users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/order-items', orderItemsRoutes);

      const response = await request(authedApp)
        .put('/order-items/10')
        .send({ quantity: 4 });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    test('should validate quantity minimum', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/order-items', orderItemsRoutes);

      const response = await request(authedApp)
        .put('/order-items/10')
        .send({ quantity: 0 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Quantity must be at least 1');
    });
  });

  describe('DELETE /order-items/:id', () => {
    test('should delete order item for owner customer', async () => {
      const mockOrder = {
        order_id: 1,
        customer_id: 1,
        orderStatus: 'pending',
        update: jest.fn().mockResolvedValue(true)
      };

      const mockOrderItem = {
        orderItem_id: 10,
        order_id: 1,
        order: mockOrder,
        destroy: jest.fn().mockResolvedValue(true)
      };

      const { OrderItem,Order } = require('../../models');
      
      OrderItem.findByPk.mockResolvedValue(mockOrderItem);
      OrderItem.findAll.mockResolvedValue([]);
      Order.update = jest.fn().mockResolvedValue(true);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/order-items', orderItemsRoutes);

      const response = await request(authedApp)
        .delete('/order-items/10');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Order item deleted successfully');
      expect(mockOrderItem.destroy).toHaveBeenCalled();
    });

    test('should return 403 for non-customer users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/order-items', orderItemsRoutes);

      const response = await request(authedApp)
        .delete('/order-items/10');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    test('should prevent deletion from non-pending orders', async () => {
      const mockOrder = {
        order_id: 1,
        customer_id: 1,
        orderStatus: 'completed' // Not pending
      };

      const mockOrderItem = {
        orderItem_id: 10,
        order: mockOrder
      };

      const { OrderItem } = require('../../models');
      OrderItem.findByPk.mockResolvedValue(mockOrderItem);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/order-items', orderItemsRoutes);

      const response = await request(authedApp)
        .delete('/order-items/10');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Cannot delete items from orders that are not pending');
    });
  });
});