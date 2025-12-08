import app from '../index';
import request from 'supertest';
const db = require('../../models');

jest.mock('../../models');
jest.mock('../utils/utils', () => ({
  hashPassword: jest.fn().mockResolvedValue("hashed123"),
  comparePassword: jest.fn()
}));
jest.mock('../middleware/auth-middleware', () => ({
  createSession: jest.fn().mockResolvedValue("session123"),
  deleteSession: jest.fn(),
 authenticate: jest.fn(() => (req, res, next) => {
  req.user = { id: 1, type: 'customer' };
  next();
}), 
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

 describe("Customer User-Controller", () => {
    const mockCustomer = {
    customer_id: 1,
    username: "testCustomer",
    email: "testCustomer@gmail.com",
    address: "Mars",
    status: "active",
    password: "hashed123",
    update: jest.fn(), 
    destroy: jest.fn(), 
    toJSON: jest.fn().mockReturnValue({
      customer_id: 1,
      username: "testCustomer",
      email: "testCustomer@gmail.com",
      address: "Mars",
      status: "active"
    })
  };
  describe("Customer CRUD", () => {
  it("Should get Customer By ID", async () => {
    (db.Customer.findByPk as jest.Mock).mockResolvedValue(mockCustomer);

    const response = await request(app).get('/api/customers/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      customer: {
        customer_id: 1,
        username: "testCustomer",
        email: "testCustomer@gmail.com",
        address: "Mars",
        status: "active"
      }
    });
  });
it("Should update Customer", async () => {
  mockCustomer.update.mockResolvedValue({
    ...mockCustomer,
    username: "UpdatedCustomer",
    email: "UpdatedCustomer@gmail.com"
  });

  mockCustomer.toJSON.mockReturnValue({
    customer_id: 1,
    username: "UpdatedCustomer",
    email: "UpdatedCustomer@gmail.com",
    address: "Mars",
    status: "active"
  });

  (db.Customer.findByPk as jest.Mock).mockResolvedValue(mockCustomer);

  const response = await request(app).put('/api/customers/1').send({
    username: "UpdatedCustomer",
    email: "UpdatedCustomer@gmail.com"
  });

  expect(response.status).toBe(200);
  expect(mockCustomer.update).toHaveBeenCalledWith({
    username: "UpdatedCustomer",
    email: "UpdatedCustomer@gmail.com"
  });
});

  })
});
