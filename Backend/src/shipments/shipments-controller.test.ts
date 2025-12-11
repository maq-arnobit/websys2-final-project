import request from 'supertest';
import express from 'express';
import shipmentsRoutes from './shipments-routes';

// Mock dependencies
jest.mock('../../models', () => ({
  Shipment: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    destroy: jest.fn()
  },
  Order: {
    findByPk: jest.fn(),
    update: jest.fn()
  },
  Customer: {},
  Dealer: {},
  OrderItem: {},
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

describe('Shipment Routes Integration Tests', () => {
  let app: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/shipments', shipmentsRoutes);
    jest.clearAllMocks();
  });

  describe('POST /shipments', () => {
    test('should create shipment successfully for dealer', async () => {
      const mockOrder = {
        order_id: 1,
        dealer_id: 1,
        orderStatus: 'processing',
        update: jest.fn().mockResolvedValue(true)
      };

      const mockShipment = {
        shipment_id: 1,
        order_id: 1,
        carrier: 'LBC Express',
        status: 'preparing',
        toJSON: jest.fn().mockReturnValue({
          shipment_id: 1,
          order_id: 1,
          carrier: 'LBC Express'
        })
      };

      const completeShipment = {
        shipment_id: 1,
        order: {
          order_id: 1,
          customer: { customer_id: 100 },
          dealer: { dealer_id: 1 },
          items: []
        }
      };

      const { Order, Shipment } = require('../../models');
      
      Order.findByPk.mockResolvedValue(mockOrder);
      Shipment.findOne.mockResolvedValue(null);
      Shipment.create.mockResolvedValue(mockShipment);
      Shipment.findByPk.mockResolvedValue(completeShipment);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/shipments', shipmentsRoutes);

      const response = await request(authedApp)
        .post('/shipments')
        .send({
          order_id: 1,
          carrier: 'LBC Express',
          status: 'preparing'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Shipment created successfully');
      expect(Shipment.create).toHaveBeenCalledWith({
        order_id: 1,
        carrier: 'LBC Express',
        status: 'preparing'
      });
      expect(mockOrder.update).toHaveBeenCalledWith({ orderStatus: 'processing' });
    });

    test('should return 403 for non-dealer users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/shipments', shipmentsRoutes);

      const response = await request(authedApp)
        .post('/shipments')
        .send({
          order_id: 1,
          carrier: 'LBC Express'
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
      authedApp.use('/shipments', shipmentsRoutes);

      const response = await request(authedApp)
        .post('/shipments')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing required fields: order_id, carrier');
    });

    test('should validate status field', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/shipments', shipmentsRoutes);

      const response = await request(authedApp)
        .post('/shipments')
        .send({
          order_id: 1,
          carrier: 'LBC Express',
          status: 'invalid_status'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid status. Must be: preparing, in_transit, delivered, or failed');
    });

    test('should return 404 when order not found', async () => {
      const { Order } = require('../../models');
      Order.findByPk.mockResolvedValue(null);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/shipments', shipmentsRoutes);

      const response = await request(authedApp)
        .post('/shipments')
        .send({
          order_id: 999,
          carrier: 'LBC Express'
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Order not found');
    });

    test('should prevent creating shipment for other dealer order', async () => {
      const mockOrder = {
        order_id: 1,
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
      authedApp.use('/shipments', shipmentsRoutes);

      const response = await request(authedApp)
        .post('/shipments')
        .send({
          order_id: 1,
          carrier: 'LBC Express'
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot create shipment for other dealers orders');
    });

    test('should prevent duplicate shipments for same order', async () => {
      const mockOrder = {
        order_id: 1,
        dealer_id: 1
      };

      const existingShipment = {
        shipment_id: 1,
        order_id: 1
      };

      const { Order, Shipment } = require('../../models');
      Order.findByPk.mockResolvedValue(mockOrder);
      Shipment.findOne.mockResolvedValue(existingShipment);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/shipments', shipmentsRoutes);

      const response = await request(authedApp)
        .post('/shipments')
        .send({
          order_id: 1,
          carrier: 'LBC Express'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Shipment already exists for this order. Use update instead.');
    });

    test('should update order status based on shipment status', async () => {
      const mockOrder = {
        order_id: 1,
        dealer_id: 1,
        update: jest.fn().mockResolvedValue(true)
      };

      const mockShipment = {
        shipment_id: 1,
        order_id: 1,
        status: 'in_transit'
      };

      const { Order, Shipment } = require('../../models');
      
      Order.findByPk.mockResolvedValue(mockOrder);
      Shipment.findOne.mockResolvedValue(null);
      Shipment.create.mockResolvedValue(mockShipment);
      Shipment.findByPk.mockResolvedValue({ shipment_id: 1 });

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/shipments', shipmentsRoutes);

      const response = await request(authedApp)
        .post('/shipments')
        .send({
          order_id: 1,
          carrier: 'LBC Express',
          status: 'in_transit'
        });

      expect(response.status).toBe(201);
      expect(mockOrder.update).toHaveBeenCalledWith({ orderStatus: 'shipped' });
    });

    test('should handle duplicate primary key retry', async () => {
      const { Order, Shipment, sequelize } = require('../../models');
      
      Order.findByPk.mockResolvedValue({
        order_id: 1,
        dealer_id: 1,
        update: jest.fn().mockResolvedValue(true)
      });
      
      Shipment.findOne.mockResolvedValue(null);
      
      const duplicateError = {
        code: '23505',
        constraint: 'shipments_pkey'
      };
      
      Shipment.create
        .mockRejectedValueOnce(duplicateError)
        .mockResolvedValueOnce({ shipment_id: 1 });
      
      Shipment.findByPk.mockResolvedValue({ shipment_id: 1 });
      sequelize.query.mockResolvedValue(true);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/shipments', shipmentsRoutes);

      const response = await request(authedApp)
        .post('/shipments')
        .send({
          order_id: 1,
          carrier: 'LBC Express'
        });

      expect(response.status).toBe(201);
      expect(sequelize.query).toHaveBeenCalledWith(
        "SELECT nextval('shipments_shipment_id_seq')"
      );
    });
  });

  describe('GET /shipments', () => {
    test('should fetch all shipments with authentication', async () => {
      const mockShipments = [
        {
          shipment_id: 1,
          order: {
            customer: { customer_id: 100 },
            dealer: { dealer_id: 1 },
            items: []
          }
        }
      ];

      const { Shipment } = require('../../models');
      Shipment.findAll.mockResolvedValue(mockShipments);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/shipments', shipmentsRoutes);

      const response = await request(authedApp)
        .get('/shipments');

      expect(response.status).toBe(200);
      expect(response.body.shipments).toEqual(mockShipments);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/shipments');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('GET /shipments/:id', () => {
    test('should fetch shipment by ID for owner customer', async () => {
      const mockShipment = {
        shipment_id: 1,
        order: {
          customer_id: 1,
          dealer_id: 2
        }
      };

      const { Shipment } = require('../../models');
      Shipment.findByPk.mockResolvedValue(mockShipment);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/shipments', shipmentsRoutes);

      const response = await request(authedApp)
        .get('/shipments/1');

      expect(response.status).toBe(200);
      expect(response.body.shipment).toEqual(mockShipment);
    });

    test('should fetch shipment by ID for owner dealer', async () => {
      const mockShipment = {
        shipment_id: 1,
        order: {
          customer_id: 100,
          dealer_id: 1
        }
      };

      const { Shipment } = require('../../models');
      Shipment.findByPk.mockResolvedValue(mockShipment);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/shipments', shipmentsRoutes);

      const response = await request(authedApp)
        .get('/shipments/1');

      expect(response.status).toBe(200);
      expect(response.body.shipment).toEqual(mockShipment);
    });

    test('should return 403 when customer accesses other customer shipment', async () => {
      const mockShipment = {
        shipment_id: 1,
        order: {
          customer_id: 999, // Different customer
          dealer_id: 2
        }
      };

      const { Shipment } = require('../../models');
      Shipment.findByPk.mockResolvedValue(mockShipment);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/shipments', shipmentsRoutes);

      const response = await request(authedApp)
        .get('/shipments/1');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot access other customers shipments');
    });

    test('should return 404 when shipment not found', async () => {
      const { Shipment } = require('../../models');
      Shipment.findByPk.mockResolvedValue(null);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/shipments', shipmentsRoutes);

      const response = await request(authedApp)
        .get('/shipments/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Shipment not found');
    });
  });

  describe('GET /shipments/order/:orderId', () => {
    test('should fetch shipment by order ID for owner customer', async () => {
      const mockShipment = {
        shipment_id: 1,
        order: {
          order_id: 1,
          customer_id: 1,
          dealer_id: 2
        }
      };

      const { Shipment } = require('../../models');
      Shipment.findOne.mockResolvedValue(mockShipment);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/shipments', shipmentsRoutes);

      const response = await request(authedApp)
        .get('/shipments/order/1');

      expect(response.status).toBe(200);
      expect(response.body.shipment).toEqual(mockShipment);
    });

    test('should return 404 when shipment not found for order', async () => {
      const { Shipment } = require('../../models');
      Shipment.findOne.mockResolvedValue(null);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/shipments', shipmentsRoutes);

      const response = await request(authedApp)
        .get('/shipments/order/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Shipment not found for this order');
    });
  });

  describe('PUT /shipments/:id', () => {
    test('should update shipment for owner dealer', async () => {
      const mockOrder = {
        order_id: 1,
        dealer_id: 1
      };

      const mockShipment = {
        shipment_id: 1,
        order_id: 1,
        order: mockOrder,
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          shipment_id: 1,
          status: 'in_transit'
        })
      };

      const updatedShipment = {
        shipment_id: 1,
        order: mockOrder
      };

      const { Shipment, Order } = require('../../models');
      
      Shipment.findByPk
        .mockResolvedValueOnce(mockShipment)
        .mockResolvedValueOnce(updatedShipment);

      Order.update = jest.fn().mockResolvedValue(true);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/shipments', shipmentsRoutes);

      const response = await request(authedApp)
        .put('/shipments/1')
        .send({ 
          carrier: 'J&T Express',
          status: 'in_transit'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Shipment updated successfully');
      expect(mockShipment.update).toHaveBeenCalledWith({
        carrier: 'J&T Express',
        status: 'in_transit'
      });
      expect(Order.update).toHaveBeenCalledWith(
        { orderStatus: 'shipped' },
        { where: { order_id: 1 } }
      );
    });

    test('should validate status field on update', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/shipments', shipmentsRoutes);

      const response = await request(authedApp)
        .put('/shipments/1')
        .send({ 
          status: 'invalid_status'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid status. Must be: preparing, in_transit, delivered, or failed');
    });

    test('should return 403 for non-dealer users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/shipments', shipmentsRoutes);

      const response = await request(authedApp)
        .put('/shipments/1')
        .send({ 
          status: 'in_transit'
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    test('should return 403 when dealer updates other dealer shipment', async () => {
      const mockShipment = {
        shipment_id: 1,
        order: {
          dealer_id: 999 // Different dealer
        }
      };

      const { Shipment } = require('../../models');
      Shipment.findByPk.mockResolvedValue(mockShipment);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/shipments', shipmentsRoutes);

      const response = await request(authedApp)
        .put('/shipments/1')
        .send({ 
          status: 'in_transit'
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Cannot update other dealers shipments');
    });
  });

  describe('DELETE /shipments/:id', () => {
    test('should delete shipment for owner dealer', async () => {
      const mockOrder = {
        order_id: 1,
        update: jest.fn().mockResolvedValue(true)
      };

      const mockShipment = {
        shipment_id: 1,
        order_id: 1,
        status: 'preparing',
        order: mockOrder,
        destroy: jest.fn().mockResolvedValue(true)
      };

      const { Shipment } = require('../../models');
      Shipment.findByPk.mockResolvedValue(mockShipment);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/shipments', shipmentsRoutes);

      const response = await request(authedApp)
        .delete('/shipments/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Shipment deleted successfully');
      expect(mockOrder.update).toHaveBeenCalledWith({ orderStatus: 'processing' });
      expect(mockShipment.destroy).toHaveBeenCalled();
    });

    test('should prevent deletion of delivered shipments', async () => {
      const mockShipment = {
        shipment_id: 1,
        status: 'delivered',
        order: {
          update: jest.fn().mockResolvedValue(true)
        }
      };

      const { Shipment } = require('../../models');
      Shipment.findByPk.mockResolvedValue(mockShipment);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/shipments', shipmentsRoutes);

      const response = await request(authedApp)
        .delete('/shipments/1');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Cannot delete delivered shipments');
    });

    test('should return 403 for non-dealer users', async () => {
      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'customer' };
        next();
      });
      authedApp.use('/shipments', shipmentsRoutes);

      const response = await request(authedApp)
        .delete('/shipments/1');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors on create', async () => {
      const { Order, Shipment } = require('../../models');
      
      Order.findByPk.mockResolvedValue({
        order_id: 1,
        dealer_id: 1,
        update: jest.fn().mockResolvedValue(true)
      });
      
      Shipment.findOne.mockResolvedValue(null);
      
      const error = new Error('Database connection failed');
      Shipment.create.mockRejectedValue(error);

      const authedApp = express();
      authedApp.use(express.json());
      authedApp.use((req: any, res, next) => {
        req.user = { id: 1, type: 'dealer' };
        next();
      });
      authedApp.use('/shipments', shipmentsRoutes);

      const response = await request(authedApp)
        .post('/shipments')
        .send({
          order_id: 1,
          carrier: 'LBC Express'
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error creating shipment');
    });
  });
});