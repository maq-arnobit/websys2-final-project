import app from '../index';
import request from 'supertest';
const db = require('../../models');

jest.mock('../../models');
jest.mock('../utils/utils', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed123'),
  comparePassword: jest.fn()
}));
jest.mock('../middleware/auth-middleware', () => ({
  createSession: jest.fn().mockResolvedValue("session123"),
  deleteSession: jest.fn(),
  authenticate: jest.fn(() => (req, res, next) => next()),
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
    password: "hashed123",
    email: "testCustomer@gmail.com",
    address: "Mars",
    status: "active",
    toJSON: jest.fn().mockReturnValue({
      customer_id: 1,
      username: "testCustomer",
      email: "testCustomer@gmail.com",
      status: "active",
      address: "Mars"
    })
  };

  it("Should get Customer By ID", async () => {
    (db.Customer.findByPk as jest.Mock).mockResolvedValue(mockCustomer);

    const response = await request(app).get('/api/customers/1');

    const userType = 'customer';
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      [userType]: {
        customer_id: 1,
        username: "testCustomer",
        email: "testCustomer@gmail.com",
        address: "Mars",
        status: "active"
      }
    });
  });
});
