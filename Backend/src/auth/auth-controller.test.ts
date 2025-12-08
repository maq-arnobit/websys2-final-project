import request from "supertest";
import app from "../index";

const db = require("../../models");

// ---------------- MOCKS ----------------

jest.mock("../../models");
jest.mock("../utils/utils", () => ({
  hashPassword: jest.fn().mockResolvedValue("hashed123"),
  comparePassword: jest.fn(), // not used in registration
}));

jest.mock('../middleware/auth-middleware', () => ({
  createSession: jest.fn().mockResolvedValue("session123"),
  deleteSession: jest.fn(),
  authenticate: jest.fn(() => (req: any, res: any, next: any) => next()),
  AuthRequest: class {} // return a fake empty class
}));


let consoleSpyError: jest.SpyInstance;

beforeEach(() => {
  consoleSpyError = jest.spyOn(console, "error").mockImplementation(() => {});
  jest.clearAllMocks();

  // IMPORTANT: your controller calls sequelize.query() in retry logic
  db.sequelize = {
    query: jest.fn().mockResolvedValue([{}]),
  };
});

afterEach(() => {
  consoleSpyError.mockRestore();
  jest.restoreAllMocks();
});

// -----------------------------------------------------
//               CUSTOMER REGISTRATION TEST
// -----------------------------------------------------

describe("Customer API Tests", () => {
  const mockCustomer = {
    customer_id: 1,
    username: "testCustomer",
    email: "testCustomer@gmail.com",
    password: "hashed123",
    status: "active",
    toJSON: jest.fn().mockReturnValue({
      customer_id: 1,
      username: "testCustomer",
      email: "testCustomer@gmail.com",
    }),
  };

  it("Should register a customer successfully", async () => {
    (db.Customer.create as jest.Mock).mockResolvedValue(mockCustomer);

    const response = await request(app)
      .post("/api/auth/register/customer")
      .send({
        username: "testCustomer",
        password: "123456",
        email: "testCustomer@gmail.com",
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "Customer registered successfully",
      customer: {
        customer_id: 1,
        username: "testCustomer",
        email: "testCustomer@gmail.com",
      },
    });
  });
});

// -----------------------------------------------------
//               DEALER REGISTRATION TEST
// -----------------------------------------------------

describe("Dealer API Tests", () => {
  const mockDealer = {
    dealer_id: 1,
    username: "testDealer",
    email: "testDealer@gmail.com",
    password: "hashed123",
    warehouse: "Manila",
    rating: 0,
    status: "active",
    toJSON: jest.fn().mockReturnValue({
      dealer_id: 1,
      username: "testDealer",
      email: "testDealer@gmail.com",
    }),
  };

  it("Should register a dealer successfully", async () => {
    (db.Dealer.create as jest.Mock).mockResolvedValue(mockDealer);

    const response = await request(app)
      .post("/api/auth/register/dealer")
      .send({
        username: "testDealer",
        password: "123456",
        email: "testDealer@gmail.com",
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "Dealer registered successfully",
      dealer: {
        dealer_id: 1,
        username: "testDealer",
        email: "testDealer@gmail.com",
      },
    });
  });
});

// -----------------------------------------------------
//               PROVIDER REGISTRATION TEST
// -----------------------------------------------------

describe("Provider API Tests", () => {
  const mockProvider = {
    provider_id: 1,
    username: "testProvider",
    email: "testProvider@gmail.com",
    businessName: "LegalSubstance",
    password: "hashed123",
    status: "active",
    toJSON: jest.fn().mockReturnValue({
      provider_id: 1,
      username: "testProvider",
      email: "testProvider@gmail.com",
    }),
  };

  it("Should register a provider successfully", async () => {
    (db.Provider.create as jest.Mock).mockResolvedValue(mockProvider);

    const response = await request(app)
      .post("/api/auth/register/provider")
      .send({
        username: "testProvider",
        password: "123456",
        email: "testProvider@gmail.com",
        businessName: "LegalSubstance",
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "Provider registered successfully",
      provider: {
        provider_id: 1,
        username: "testProvider",
        email: "testProvider@gmail.com",
      },
    });
  });
});
