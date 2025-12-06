import { CustomerController } from './customers-controller';
import { hashPassword } from '../auth/auth-middleware';

// Mock the database
const mockCustomers = new Map();
const mockOrders = new Map();

// Mock the entire database module
jest.mock('../../models', () => {
  return {
    Customer: {
      findByPk: jest.fn(async (id) => {
        const customer = mockCustomers.get(parseInt(id));
        if (customer) {
          // Return customer with mock methods
          return {
            ...customer,
            update: jest.fn(async (data) => {
              Object.assign(customer, data);
              return {
                ...customer,
                ...data,
                // Mock password hashing
                password: data.password ? `hashed_${data.password}` : customer.password
              };
            }),
            destroy: jest.fn(async () => {
              mockCustomers.delete(customer.id);
              return true;
            })
          };
        }
        return null;
      }),
      create: jest.fn(async (data) => {
        const id = mockCustomers.size + 1;
        const customer = { ...data, id };
        mockCustomers.set(id, customer);
        return customer;
      })
    },
    Order: {
      findAll: jest.fn(async (options) => {
        if (options?.where?.customer_id) {
          const customerId = parseInt(options.where.customer_id);
          // Return mock orders for this customer
          return Array.from(mockOrders.values())
            .filter(order => order.customer_id === customerId)
            .map(order => ({
              ...order,
              items: [
                {
                  substance: { name: 'Test Substance 1', price: 100.50 },
                  quantity: 1,
                  price: 100.50
                }
              ],
              dealer: {
                id: 1,
                business_name: 'Test Pharmacy',
                email: 'dealer@test.com'
              },
              shipment: {
                tracking_number: 'TRACK123',
                status: 'pending'
              }
            }));
        }
        return [];
      }),
      create: jest.fn(async (data) => {
        const id = mockOrders.size + 1;
        const order = { ...data, id };
        mockOrders.set(id, order);
        return order;
      })
    },
    OrderItem: {
      create: jest.fn()
    },
    Substance: {
      create: jest.fn()
    },
    Dealer: {
      create: jest.fn(),
      findByPk: jest.fn()
    },
    Shipment: {
      create: jest.fn()
    }
  };
});

// Import AFTER mocking
const db = require('../../models');

// Mock response
const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('CustomerController', () => {
  // Create test data inside describe block
  let testCustomer: any;

  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();
    mockCustomers.clear();
    mockOrders.clear();

    // Create test customer directly
    testCustomer = {
      id: 1,
      username: 'testcustomer',
      email: 'customer@test.com',
      password: await hashPassword('password123'),
      address: '123 Test St',
      status: 'active'
    };

    // Add to mock database
    mockCustomers.set(testCustomer.id, testCustomer);

    // Mock findByPk to return our test customer
    (db.Customer.findByPk as jest.Mock).mockImplementation(async (id) => {
      const customer = mockCustomers.get(parseInt(id));
      if (customer) {
        const { password, ...customerWithoutPassword } = customer;
        return {
          ...customerWithoutPassword,
          id: customer.id,
          update: jest.fn(async (data) => {
            Object.assign(customer, data);
            return {
              ...customerWithoutPassword,
              ...data,
              password: data.password ? `hashed_${data.password}` : customer.password
            };
          }),
          destroy: jest.fn(async () => {
            mockCustomers.delete(customer.id);
            return true;
          })
        };
      }
      return null;
    });

    // Mock create to add to our mock database
    (db.Customer.create as jest.Mock).mockImplementation(async (data) => {
      const id = mockCustomers.size + 1;
      const newCustomer = { ...data, id };
      mockCustomers.set(id, newCustomer);
      return newCustomer;
    });
  });

  describe('getById', () => {
    it('should return customer profile when authorized', async () => {
      const req = {
        params: { id: testCustomer.id.toString() },
        user: {
          id: testCustomer.id,
          type: 'customer'
        }
      } as any;

      const res = mockResponse();

      await CustomerController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: expect.objectContaining({
            id: testCustomer.id,
            username: testCustomer.username
          })
        })
      );
    });

    it('should return 403 when accessing another customer profile', async () => {
      const req = {
        params: { id: '999' },
        user: {
          id: testCustomer.id,
          type: 'customer'
        }
      } as any;

      const res = mockResponse();

      await CustomerController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied. You can only view your own profile.'
      });
    });

    it('should return 403 when not authenticated', async () => {
      const req = {
        params: { id: testCustomer.id.toString() },
        user: null
      } as any;

      const res = mockResponse();

      await CustomerController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 404 when customer does not exist', async () => {
      // Setup: Mock findByPk to return null for this specific call
      (db.Customer.findByPk as jest.Mock).mockResolvedValueOnce(null);

      const req = {
        params: { id: '9999' },
        user: {
          id: 9999,
          type: 'customer'
        }
      } as any;

      const res = mockResponse();

      await CustomerController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Customer not found'
      });
    });
  });

  describe('update', () => {
    it('should update customer profile when authorized', async () => {
      const req = {
        params: { id: testCustomer.id.toString() },
        body: {
          username: 'updatedcustomer',
          email: 'updated@test.com',
          address: '456 Updated St'
        },
        user: {
          id: testCustomer.id,
          type: 'customer'
        }
      } as any;

      const res = mockResponse();

      await CustomerController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Customer updated successfully'
        })
      );
    });

    it('should update password when provided', async () => {
      const req = {
        params: { id: testCustomer.id.toString() },
        body: {
          password: 'newpassword123'
        },
        user: {
          id: testCustomer.id,
          type: 'customer'
        }
      } as any;

      const res = mockResponse();

      await CustomerController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Customer updated successfully'
        })
      );
    });

    it('should return 400 for duplicate email', async () => {
      // Mock unique constraint error
      const error = new Error('Duplicate');
      error.name = 'SequelizeUniqueConstraintError';

      // Mock the customer instance's update method to throw error
      const mockCustomerInstance = {
        update: jest.fn().mockRejectedValue(error)
      };
      (db.Customer.findByPk as jest.Mock).mockResolvedValueOnce(mockCustomerInstance);

      const req = {
        params: { id: testCustomer.id.toString() },
        body: {
          email: 'existing@test.com'
        },
        user: {
          id: testCustomer.id,
          type: 'customer'
        }
      } as any;

      const res = mockResponse();

      await CustomerController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Username or email already exists'
      });
    });

    it('should return 403 when unauthorized', async () => {
      const req = {
        params: { id: '999' },
        body: { username: 'hacker' },
        user: {
          id: testCustomer.id,
          type: 'customer'
        }
      } as any;

      const res = mockResponse();

      await CustomerController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('delete', () => {
    it('should delete customer account when authorized', async () => {
      const req = {
        params: { id: testCustomer.id.toString() },
        user: {
          id: testCustomer.id,
          type: 'customer'
        }
      } as any;

      const res = mockResponse();

      await CustomerController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Customer account deleted successfully'
      });
    });

    it('should return 403 when trying to delete another customer', async () => {
      const req = {
        params: { id: '999' },
        user: {
          id: testCustomer.id,
          type: 'customer'
        }
      } as any;

      const res = mockResponse();

      await CustomerController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 404 when customer does not exist', async () => {
      // Mock findByPk to return null
      (db.Customer.findByPk as jest.Mock).mockResolvedValueOnce(null);

      const req = {
        params: { id: '99999' },
        user: {
          id: 99999,
          type: 'customer'
        }
      } as any;

      const res = mockResponse();

      await CustomerController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Customer not found'
      });
    });
  });

  describe('getOrders', () => {
    it('should return customer orders when authorized', async () => {
      // Add a mock order for the customer
      mockOrders.set(1, {
        id: 1,
        customer_id: testCustomer.id,
        dealer_id: 1,
        total_amount: 100.50,
        status: 'pending'
      });

      const req = {
        params: { id: testCustomer.id.toString() },
        user: {
          id: testCustomer.id,
          type: 'customer'
        }
      } as any;

      const res = mockResponse();

      await CustomerController.getOrders(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        orders: expect.arrayContaining([
          expect.objectContaining({
            customer_id: testCustomer.id
          })
        ])
      });
    });

    it('should return 403 when unauthorized', async () => {
      const req = {
        params: { id: '999' },
        user: {
          id: testCustomer.id,
          type: 'customer'
        }
      } as any;

      const res = mockResponse();

      await CustomerController.getOrders(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return empty array when no orders', async () => {
      // Mock Order.findAll to return empty array
      (db.Order.findAll as jest.Mock).mockResolvedValueOnce([]);

      const req = {
        params: { id: testCustomer.id.toString() },
        user: {
          id: testCustomer.id,
          type: 'customer'
        }
      } as any;

      const res = mockResponse();

      await CustomerController.getOrders(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        orders: []
      });
    });
  });
});