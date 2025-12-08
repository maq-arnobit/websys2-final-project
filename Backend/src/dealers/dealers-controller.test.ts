import app from '../index';
import request from 'supertest';
import { comparePassword, hashPassword } from '../utils/utils';
import { compare } from 'bcrypt';
import { authenticate, deleteSession } from '../middleware/auth-middleware';
const db = require('../../models');

jest.mock('../../models');
jest.mock('../utils/utils', () =>  ({
    hashPassword: jest.fn().mockResolvedValue('hashed123'),
    comparePassword: jest.fn()
}));
jest.mock('../middleware/auth-middleware', () => ({
    createSession: jest.fn().mockResolvedValue('session123'),
    deleteSession: jest.fn(),
    authenticate: jest.fn(() => (req,res,next) => {
        req.user = {id:1 ,type: 'dealer'};
        next();
    }),
    AuthRequest: jest.requireActual("../middleware/auth-middleware").AuthRequest
}));

let consoleSpyError: jest.SpyInstance;

beforeEach(() => {
    consoleSpyError = jest.spyOn(console,'error').mockImplementation(() => {});
    jest.clearAllMocks();
})
afterEach(() => {
    consoleSpyError.mockRestore();
    jest.restoreAllMocks();
})

describe("Dealer Controller", () => {

    describe("Dealer Inventory", () => { 
 const mockInventory = [
  {
    inventory_id: 1,
    dealer_id: 10,
    substance_id: 5,
    quantity: 50,
    image_url: "http://example.com/inventory/1.jpg", // placeholder URL
    substance: {
      substance_id: 5,
      name: "Premium Coffee",
      category: "Beverage",
      description: "High-quality roasted beans",
      image_url: "http://example.com/substance/5.jpg", // placeholder URL
      provider: {
        provider_id: 3,
        username: "providerA",
        businessName: "Substance Source Co.",
        email: "providerA@gmail.com",
        status: "active"
      }
    }
  },
  {
    inventory_id: 2,
    dealer_id: 10,
    substance_id: 7,
    quantity: 20,
    image_url: "http://example.com/inventory/2.jpg",
    substance: {
      substance_id: 7,
      name: "Organic Tea",
      category: "Beverage",
      description: "Imported green tea leaves",
      image_url: "http://example.com/substance/7.jpg",
      provider: {
        provider_id: 4,
        username: "providerB",
        businessName: "Tea Masters Inc.",
        email: "providerB@gmail.com",
        status: "active"
      }
    }
  }
];


        it("Should get Dealer Inventory", async () => {
        (db.Inventory.findAll as jest.Mock).mockResolvedValue(mockInventory);

        const response = await request(app).get('/api/dealers/1/inventory')

        expect(response.status).toBe(200);
        expect(response.body).toEqual({inventory: mockInventory});
    });
    })
    describe("Dealer Order", () => {
        const mockOrders = [
  {
    order_id: 1,
    dealer_id: 10,
    customer: {
      customer_id: 100,
      username: "john_doe",
      email: "john@example.com"
    },
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
      },
      {
        order_item_id: 2,
        order_id: 1,
        quantity: 1,
        price: 299.0,
        substance: {
          substance_id: 6,
          name: "Dark Chocolate",
          category: "Snack",
          description: "Rich and bitter"
        }
      }
    ],
    shipment: {
      shipment_id: 50,
      order_id: 1,
      tracking_number: "TRACK123456",
      status: "delivered",
      carrier: "LBC Express"
    },
    total_price: 1298.5,
    status: "delivered",
    toJSON: jest.fn().mockReturnThis() // Important for your controller
  },
  {
    order_id: 2,
    dealer_id: 10,
    customer: {
      customer_id: 101,
      username: "jane_doe",
      email: "jane@example.com"
    },
    items: [
      {
        order_item_id: 3,
        order_id: 2,
        quantity: 3,
        price: 150.0,
        substance: {
          substance_id: 7,
          name: "Organic Tea",
          category: "Beverage",
          description: "Imported green tea leaves"
        }
      }
    ],
    shipment: {
      shipment_id: 51,
      order_id: 2,
      tracking_number: "TRACK654321",
      status: "in transit",
      carrier: "J&T Express"
    },
    total_price: 450.0,
    status: "processing",
    toJSON: jest.fn().mockReturnThis()
  }
];
        it("Should get Dealer Orders", async () => {
            (db.Order.findAll as jest.Mock).mockResolvedValue(mockOrders);

            const response = await request(app).get('./api/dealers/1/orders')

            expect(response.status).toBe(200);
            expect(response.body).toEqual({inventory: mockOrders});
    });
})
    describe("Dealer Purchase Orders", () => {
        it("Should get Dealer Purchase Order", async () => {

    });
    })
})
