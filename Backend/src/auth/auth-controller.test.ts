import request from 'supertest';
import app from '../index';
const db = require('../../models');


jest.mock('../../models');
jest.mock('../utils/utils', () => ({
  hashPassword: jest.fn().mockResolvedValue("hashed123"),
  comparePassword: jest.fn()
}));
jest.mock('../middleware/auth-middleware', () => ({
  createSession: jest.fn().mockResolvedValue("session123"),
  deleteSession: jest.fn(),
  authenticate: jest.fn(() => (req, res, next) => next()), // simple passthrough
  AuthRequest: jest.requireActual('../middleware/auth-middleware').AuthRequest
}));

let consoleSpyError: jest.SpyInstance

  beforeEach(() => {
    consoleSpyError = jest.spyOn(console,'error').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpyError.mockRestore()
    jest.restoreAllMocks();
  })

describe("Customer API Tests", () => {
  const mockCustomer = {
    customer_id: 1,
    username: "testCustomer",
    password: "hashed123",
    email: "testCustomer@gmail.com",
    address: "Mars",
    status: "active",
    toJSON: jest.fn().mockReturnValue({
      customer_id: 1,
      username: "testCustomer",
      email: "testCustomer@gmail.com"
    })
  };

  it("Should register a customer successfully", async () => {
    (db.Customer.create as jest.Mock).mockResolvedValue(mockCustomer);

    const response = await request(app)
      .post('/api/auth/register/customer')  
      .send({
        username: "testCustomer",
        password: "hashed123",
        email: "testCustomer@gmail.com",
        status: "active",
        address: "Mars"
      });

const userType = "customer"; 

expect(response.status).toBe(201);
expect(response.body).toEqual({
  message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} registered successfully`,
  [userType]: {
    customer_id: 1,
    username: "testCustomer",
    email: "testCustomer@gmail.com"
  }
});
  });

});

describe("Dealer API Test", () => {
      const mockDealer = {
    dealer_id: 1,
    username: "testDealer",
    warehouse: "Manila",
    password: "hashed123",
    email: "testDealer@gmail.com",
    rating: 5,
    status: "active",
    toJSON: jest.fn().mockReturnValue({
        dealer_id: 1,
        username: "testDealer",
        email: "testDealer@gmail.com"
    })
  };
    it("Should register a dealear successfully", async () => {
        (db.Dealer.create as jest.Mock).mockResolvedValue(mockDealer);

        const response = await request(app).post('/api/auth/register/dealer').send({
        username: "testDealer",
        password: "hashed123",
        email: "testDealer@gmail.com",
        status: "active",
        warehouse: "Manila"
        })
        const userType = 'dealer';

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
        message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} registered successfully`,
        [userType]: {
        dealer_id: 1,
        username: "testDealer",
        email: "testDealer@gmail.com"
  }
});
    });
})
describe("Provider API Test", () => {
      const mockProvider = {
    provider_id: 1,
    username: "testProvider",
    businessName: "LegalSubstance",
    password: "hashed123",
    email: "testProvider@gmail.com",
    status: "active",
    toJSON: jest.fn().mockReturnValue({
        provider_id: 1,
        username: "testProvider",
        email: "testProvider@gmail.com"
    })
  };
    it("Should register a provider successfully", async () => {
        (db.Dealer.create as jest.Mock).mockResolvedValue(mockProvider);

        const response = await request(app).post('/api/auth/register/provider').send({
        username: "testProvider",
        password: "hashed123",
        email: "testProvider@gmail.com",
        status: "active",
        businessName: "LegalSubstance"
        })
        const userType = 'provider';

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
        message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} registered successfully`,
        [userType]: {
        provider_id: 1,
        username: "testProvider",
        email: "testProvider@gmail.com"
  }
});
    });
})