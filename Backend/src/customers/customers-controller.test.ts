import request from 'supertest';
import express from 'express';
import customersRoutes from './customers-routes';

// Mock dependencies
jest.mock('../../models', () => ({
  Customer: {
    findByPk: jest.fn(),
    create: jest.fn()
  },
  Order: {
    findAll: jest.fn()
  },
  OrderItem: {},
  Substance: {},
  Dealer: {},
  Shipment: {}
}));

jest.mock('../utils/utils', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed_password')
}));

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

describe('Customer Routes Integration Tests', () => {
  let app: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api', customersRoutes);
    jest.clearAllMocks();
  });

  describe('GET /customers/:id', () => {
    test('should return customer profile when authenticated', async () => {
      const mockCustomer = {
        customer_id: 1,
        username: 'testcustomer',
        email: 'test@example.com'
      };

      const { Customer } = require('../../models');
      Customer.findByPk.mockResolvedValue(mockCustomer);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/customers', customersRoutes);

      const response = await request(authedApp)
        .get('/customers/1');

      expect(response.status).toBe(200);
      expect(response.body.customer).toEqual(mockCustomer);
    });

    test('should return 403 for non-customer users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' }; // Wrong user type
        next();
      });
      authedApp.use('/customers', customersRoutes);

      const response = await request(authedApp)
        .get('/customers/1');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    test('should return 403 when accessing other customer profile', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 2, type: 'customer' }; // Different customer ID
        next();
      });
      authedApp.use('/customers', customersRoutes);

      const response = await request(authedApp)
        .get('/customers/1');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot access other profiles');
    });
  });

  describe('PUT /customers/:id', () => {
    test('should update customer successfully', async () => {
      const mockCustomer = {
        update: jest.fn().mockResolvedValue(true),
        customer_id: 1
      };
      const updatedCustomer = {
        customer_id: 1,
        username: 'updateduser'
      };

      const { Customer } = require('../../models');
      Customer.findByPk
        .mockResolvedValueOnce(mockCustomer)
        .mockResolvedValueOnce(updatedCustomer);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/customers', customersRoutes);

      const response = await request(authedApp)
        .put('/customers/1')
        .send({ username: 'updateduser' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Customer updated successfully');
    });

    test('should handle password update', async () => {
      const mockCustomer = {
        update: jest.fn().mockResolvedValue(true),
        customer_id: 1
      };
      const updatedCustomer = { customer_id: 1 };

      const { Customer } = require('../../models');
      Customer.findByPk
        .mockResolvedValueOnce(mockCustomer)
        .mockResolvedValueOnce(updatedCustomer);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/customers', customersRoutes);

      const response = await request(authedApp)
        .put('/customers/1')
        .send({ password: 'newpassword123' });

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /customers/:id', () => {
    test('should delete customer successfully', async () => {
      const mockCustomer = {
        destroy: jest.fn().mockResolvedValue(true)
      };

      const { Customer } = require('../../models');
      Customer.findByPk.mockResolvedValue(mockCustomer);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/customers', customersRoutes);

      const response = await request(authedApp)
        .delete('/customers/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Customer account deleted successfully');
    });
  });

  describe('GET /customers/:id/orders', () => {
    test('should fetch customer orders', async () => {
      const mockOrders = [
        { order_id: 1, total_amount: 100.50 }
      ];

      const { Order } = require('../../models');
      Order.findAll.mockResolvedValue(mockOrders);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/customers', customersRoutes);

      const response = await request(authedApp)
        .get('/customers/1/orders');

      expect(response.status).toBe(200);
      expect(response.body.orders).toEqual(mockOrders);
    });

    test('should return empty array when no orders', async () => {
      const { Order } = require('../../models');
      Order.findAll.mockResolvedValue([]);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/customers', customersRoutes);

      const response = await request(authedApp)
        .get('/customers/1/orders');

      expect(response.status).toBe(200);
      expect(response.body.orders).toEqual([]);
    });
  });
});