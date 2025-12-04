'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('orders', [
      {
        order_id: 1,
        customer_id: 1,
        dealer_id: 1,
        orderDate: new Date('2024-10-15 10:30:00'),
        orderStatus: 'delivered',
        totalAmount: 125.50,
        shippingCost: 15.00,
        deliveryAddress: '123 Main St, New York, NY 10001',
        paymentStatus: 'paid'
      },
      {
        order_id: 2,
        customer_id: 2,
        dealer_id: 1,
        orderDate: new Date('2024-10-18 14:20:00'),
        orderStatus: 'delivered',
        totalAmount: 89.99,
        shippingCost: 10.00,
        deliveryAddress: '456 Oak Ave, Los Angeles, CA 90001',
        paymentStatus: 'paid'
      },
      {
        order_id: 3,
        customer_id: 3,
        dealer_id: 2,
        orderDate: new Date('2024-10-22 09:15:00'),
        orderStatus: 'delivered',
        totalAmount: 220.00,
        shippingCost: 20.00,
        deliveryAddress: '789 Pine Rd, Chicago, IL 60601',
        paymentStatus: 'paid'
      },
      {
        order_id: 4,
        customer_id: 1,
        dealer_id: 2,
        orderDate: new Date('2024-11-01 11:45:00'),
        orderStatus: 'shipped',
        totalAmount: 168.75,
        shippingCost: 18.00,
        deliveryAddress: '123 Main St, New York, NY 10001',
        paymentStatus: 'paid'
      },
      {
        order_id: 5,
        customer_id: 5,
        dealer_id: 3,
        orderDate: new Date('2024-11-05 16:30:00'),
        orderStatus: 'delivered',
        totalAmount: 95.00,
        shippingCost: 8.00,
        deliveryAddress: '654 Maple Dr, Phoenix, AZ 85001',
        paymentStatus: 'paid'
      },
      {
        order_id: 6,
        customer_id: 6,
        dealer_id: 3,
        orderDate: new Date('2024-11-08 13:00:00'),
        orderStatus: 'processing',
        totalAmount: 142.50,
        shippingCost: 12.00,
        deliveryAddress: '987 Cedar Ln, Philadelphia, PA 19019',
        paymentStatus: 'paid'
      },
      {
        order_id: 7,
        customer_id: 7,
        dealer_id: 5,
        orderDate: new Date('2024-11-10 10:00:00'),
        orderStatus: 'shipped',
        totalAmount: 210.00,
        shippingCost: 15.00,
        deliveryAddress: '147 Birch St, San Antonio, TX 78201',
        paymentStatus: 'paid'
      },
      {
        order_id: 8,
        customer_id: 9,
        dealer_id: 5,
        orderDate: new Date('2024-11-12 15:20:00'),
        orderStatus: 'processing',
        totalAmount: 178.25,
        shippingCost: 14.00,
        deliveryAddress: '369 Spruce Rd, Dallas, TX 75201',
        paymentStatus: 'paid'
      },
      {
        order_id: 9,
        customer_id: 10,
        dealer_id: 6,
        orderDate: new Date('2024-11-15 12:30:00'),
        orderStatus: 'pending',
        totalAmount: 256.00,
        shippingCost: 20.00,
        deliveryAddress: '741 Ash Dr, San Jose, CA 95101',
        paymentStatus: 'pending'
      },
      {
        order_id: 10,
        customer_id: 2,
        dealer_id: 6,
        orderDate: new Date('2024-11-18 09:45:00'),
        orderStatus: 'pending',
        totalAmount: 132.50,
        shippingCost: 10.00,
        deliveryAddress: '456 Oak Ave, Los Angeles, CA 90001',
        paymentStatus: 'pending'
      },
      {
        order_id: 11,
        customer_id: 3,
        dealer_id: 1,
        orderDate: new Date('2024-11-19 14:00:00'),
        orderStatus: 'processing',
        totalAmount: 195.75,
        shippingCost: 16.00,
        deliveryAddress: '789 Pine Rd, Chicago, IL 60601',
        paymentStatus: 'paid'
      },
      {
        order_id: 12,
        customer_id: 5,
        dealer_id: 2,
        orderDate: new Date('2024-11-20 11:15:00'),
        orderStatus: 'cancelled',
        totalAmount: 88.00,
        shippingCost: 8.00,
        deliveryAddress: '654 Maple Dr, Phoenix, AZ 85001',
        paymentStatus: 'refunded'
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('orders', null, {});
  }
};