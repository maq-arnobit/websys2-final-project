import request from 'supertest';
import express, { Express } from 'express';
import authRoutes from './auth-routes';

// Mock database models
jest.mock('../../models', () => ({
  Customer: {
    create: jest.fn(),
    findByPk: jest.fn()
  },
  Dealer: {
    create: jest.fn(),
    findByPk: jest.fn()
  },
  Provider: {
    create: jest.fn(),
    findByPk: jest.fn()
  },
  sequelize: {
    query: jest.fn()
  }
}));

// Mock utils
jest.mock('../utils/utils', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed_password')
}));

// Mock passport
jest.mock('../passport/passport', () => ({
  authenticate: jest.fn()
}));

describe('Auth Routes Integration Tests', () => {
  let app: Express;
  let mockSession: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Mock session middleware - using 'any' to avoid TypeScript issues
    mockSession = {};
    app.use((req: any, res, next) => {
      req.session = mockSession;
      
      // Mock authentication methods
      req.isAuthenticated = jest.fn(() => !!req.user);
      
      req.login = jest.fn((user: any, callback: (err?: any) => void) => {
        req.user = user;
        callback(null);
      });
      
      req.logout = jest.fn((callback: (err?: any) => void) => {
        req.user = null;
        callback(null);
      });
      
      next();
    });
    
    app.use('/auth', authRoutes);
  });

  describe('Registration Endpoints', () => {
    test('POST /auth/register/customer - should create customer', async () => {
      const { Customer } = require('../../models');
      Customer.create.mockResolvedValue({
        toJSON: () => ({
          customer_id: 1,
          username: 'testcustomer',
          email: 'customer@test.com',
          password: 'hashed'
        })
      });

      const response = await request(app)
        .post('/auth/register/customer')
        .send({
          username: 'testcustomer',
          password: 'password123',
          email: 'customer@test.com'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Customer registered successfully');
    });

    test('POST /auth/register/dealer - should create dealer', async () => {
      const { Dealer } = require('../../models');
      Dealer.create.mockResolvedValue({
        toJSON: () => ({
          dealer_id: 1,
          username: 'testdealer',
          email: 'dealer@test.com',
          password: 'hashed'
        })
      });

      const response = await request(app)
        .post('/auth/register/dealer')
        .send({
          username: 'testdealer',
          password: 'password123',
          email: 'dealer@test.com'
        });

      expect(response.status).toBe(201);
    });

    test('POST /auth/register/provider - should create provider', async () => {
      const { Provider } = require('../../models');
      Provider.create.mockResolvedValue({
        toJSON: () => ({
          provider_id: 1,
          username: 'testprovider',
          email: 'provider@test.com',
          businessName: 'Test Business',
          password: 'hashed'
        })
      });

      const response = await request(app)
        .post('/auth/register/provider')
        .send({
          username: 'testprovider',
          password: 'password123',
          email: 'provider@test.com',
          businessName: 'Test Business'
        });

      expect(response.status).toBe(201);
    });
  });

  describe('Login Endpoint', () => {
    test('POST /auth/login - should login successfully', async () => {
      const { authenticate } = require('../passport/passport');
      
      // Mock successful authentication
      authenticate.mockImplementation((strategy: string, callback: Function) => {
        return (req: any, res: any, next: any) => {
          const mockUser = {
            id: 1,
            type: 'customer',
            username: 'testuser',
            email: 'test@example.com'
          };
          callback(null, mockUser, null);
        };
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
          userType: 'customer'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
    });
  });

  describe('Protected Endpoints', () => {
    test('GET /auth/profile - should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Unauthorized');
    });

    test('GET /auth/profile - should return profile when authenticated', async () => {
      // Mock database response
      const { Customer } = require('../../models');
      Customer.findByPk.mockResolvedValue({
        customer_id: 1,
        username: 'testuser',
        email: 'test@example.com'
      });

      // Create a server with authenticated user
      const authedApp = express();
      authedApp.use(express.json());
      
      authedApp.use((req: any, res, next) => {
        // Set authenticated user
        req.user = {
          id: 1,
          type: 'customer',
          username: 'testuser'
        };
        
        req.isAuthenticated = () => true;
        req.session = {};
        req.login = jest.fn();
        req.logout = jest.fn();
        next();
      });
      
      authedApp.use('/auth', authRoutes);

      const response = await request(authedApp)
        .get('/auth/profile');

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe('testuser');
    });

    test('POST /auth/logout - should logout successfully', async () => {
      // Create app with authenticated user
      const authedApp = express();
      authedApp.use(express.json());
      
      let isAuthenticated = true;
      
      authedApp.use((req: any, res, next) => {
        req.user = isAuthenticated ? {
          id: 1,
          type: 'customer',
          username: 'testuser'
        } : null;
        
        req.isAuthenticated = () => isAuthenticated;
        req.session = {
          destroy: jest.fn((callback) => callback(null))
        };
        
        req.logout = jest.fn((callback) => {
          isAuthenticated = false;
          req.user = null;
          callback(null);
        });
        
        next();
      });
      
      authedApp.use('/auth', authRoutes);

      const response = await request(authedApp)
        .post('/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logout successful');
    });
  });
});