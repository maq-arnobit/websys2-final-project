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

  describe("Customer Controller Test", () => {
const mockOrders = [
  {
    order_id: 1,
    customer_id: 1,
    dealer_id: 10,
    shipment_id: 100,
    total_price: 999,
    status: "delivered",

    // included association: OrderItem[]
    items: [
      {
        order_item_id: 1,
        order_id: 1,
        quantity: 2,
        price: 499.5,

        substance: {
          substance_id: 5,
          name: "Premium Coffee",
          category: "Beverage",
          description: "High-quality roasted beans"
        }
      }
    ],

    // included association: Dealer
    dealer: {
      dealer_id: 10,
      username: "dealerA",
      email: "dealerA@gmail.com",
      warehouse: "Manila",
      status: "active"
      // password excluded by attributes
    },

    // included association: Shipment
    shipment: {
      shipment_id: 100,
      order_id: 1,
      tracking_number: "TRACK123456",
      status: "delivered",
      carrier: "LBC Express"
    }
  }
];
it("Should get customer Orders", async () => {
    (db.Order.findAll as jest.Mock).mockResolvedValue(mockOrders);

    const response = await request(app).get('/api/customers/1/orders');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ orders: mockOrders });


})
  })