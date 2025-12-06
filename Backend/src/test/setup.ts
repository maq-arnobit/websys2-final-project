const db = require('../../models');
import { hashPassword } from '../auth/auth-middleware';

// Global test data
let testData: any;

beforeAll(async () => {
  // Sync test database (use your actual sequelize instance)
  await db.sequelize.sync({ force: true });
  
  // Create basic test data
  testData = await createTestData();
  (global as any).testData = testData;
});

afterAll(async () => {
  await db.sequelize.close();
});

// Simple test data creation
async function createTestData() {
  // Create test customer
  const testCustomer = await db.Customer.create({
    username: 'testcustomer',
    email: 'customer@test.com',
    password: await hashPassword('password123'),
    address: '123 Test St',
    status: 'active'
  });

  // Create test dealer
  const testDealer = await db.Dealer.create({
    username: 'testdealer',
    email: 'dealer@test.com',
    password: await hashPassword('password123'),
    warehouse: 'Test Pharmacy',
    rating: '5'
  });

  // Create one order for testing
  const testOrder = await db.Order.create({
    customer_id: testCustomer.id,
    dealer_id: testDealer.id,
    orderDate: "2000-01-01",
    totalAmount: 100.50,
    shippingCost: 100,
    deliveryAddress: "Kanto",
    paymentStatus: "pending",
    paymentMethod: "credit_card",
    paymentDate: "2000-02-02",
  });

  return { testCustomer, testDealer, testOrder };
}