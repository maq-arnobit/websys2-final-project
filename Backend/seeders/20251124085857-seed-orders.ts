'use strict';
import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkInsert('orders', [
      {
        customer_id: 1,
        dealer_id: 1,
        orderDate: new Date('2024-10-15 10:30:00'),
        orderStatus: 'delivered',
        totalAmount: 125.50,
        shippingCost: 15.00,
        deliveryAddress: '123 Main St, New York, NY 10001',
        paymentStatus: 'paid',
        paymentMethod: 'Credit Card',
        paymentDate: new Date('2024-10-15 10:30:00')
      },
      {
        customer_id: 2,
        dealer_id: 1,
        orderDate: new Date('2024-10-18 14:20:00'),
        orderStatus: 'delivered',
        totalAmount: 89.99,
        shippingCost: 10.00,
        deliveryAddress: '456 Oak Ave, Los Angeles, CA 90001',
        paymentStatus: 'paid',
        paymentMethod: 'PayPal',
        paymentDate: new Date('2024-10-18 14:20:00')
      },
      {
        customer_id: 9,
        dealer_id: 5,
        orderDate: new Date('2024-11-12 15:20:00'),
        orderStatus: 'processing',
        totalAmount: 178.25,
        shippingCost: 14.00,
        deliveryAddress: '369 Spruce Rd, Dallas, TX 75201',
        paymentStatus: 'paid',
        paymentMethod: 'Credit Card',
        paymentDate: new Date('2024-11-12 15:20:00')
      },
      {
        customer_id: 10,
        dealer_id: 6,
        orderDate: new Date('2024-11-15 12:30:00'),
        orderStatus: 'pending',
        totalAmount: 256.00,
        shippingCost: 20.00,
        deliveryAddress: '741 Ash Dr, San Jose, CA 95101',
        paymentStatus: 'pending',
        paymentMethod: 'Cash on Delivery',
        paymentDate: null // pending payment has no date yet
      },
      {
        customer_id: 2,
        dealer_id: 6,
        orderDate: new Date('2024-11-18 09:45:00'),
        orderStatus: 'pending',
        totalAmount: 132.50,
        shippingCost: 10.00,
        deliveryAddress: '456 Oak Ave, Los Angeles, CA 90001',
        paymentStatus: 'pending',
        paymentMethod: 'PayPal',
        paymentDate: new Date('2024-11-18 09:45:00')
      },
      {
        customer_id: 3,
        dealer_id: 1,
        orderDate: new Date('2024-11-19 14:00:00'),
        orderStatus: 'processing',
        totalAmount: 195.75,
        shippingCost: 16.00,
        deliveryAddress: '789 Pine Rd, Chicago, IL 60601',
        paymentStatus: 'paid',
        paymentMethod: 'Credit Card',
        paymentDate: new Date('2024-11-19 14:00:00')
      },
      {
        customer_id: 5,
        dealer_id: 2,
        orderDate: new Date('2024-11-20 11:15:00'),
        orderStatus: 'cancelled',
        totalAmount: 88.00,
        shippingCost: 8.00,
        deliveryAddress: '654 Maple Dr, Phoenix, AZ 85001',
        paymentStatus: 'refunded',
        paymentMethod: 'Credit Card',
        paymentDate: new Date('2024-11-20 11:15:00')
      },
      {
        customer_id: 8,
        dealer_id: 4,
        orderDate: new Date('2024-11-21 16:45:00'),
        orderStatus: 'delivered',
        totalAmount: 315.20,
        shippingCost: 25.00,
        deliveryAddress: '852 Walnut St, San Diego, CA 92101',
        paymentStatus: 'paid',
        paymentMethod: 'PayPal',
        paymentDate: new Date('2024-11-21 16:45:00')
      },
      {
        customer_id: 4,
        dealer_id: 4,
        orderDate: new Date('2024-11-22 08:30:00'),
        orderStatus: 'shipped',
        totalAmount: 187.90,
        shippingCost: 12.00,
        deliveryAddress: '321 Elm St, Houston, TX 77001',
        paymentStatus: 'paid',
        paymentMethod: 'Credit Card',
        paymentDate: new Date('2024-11-22 08:30:00')
      },
      {
        customer_id: 7,
        dealer_id: 1,
        orderDate: new Date('2024-11-23 17:20:00'),
        orderStatus: 'pending',
        totalAmount: 76.50,
        shippingCost: 7.00,
        deliveryAddress: '147 Birch St, San Antonio, TX 78201',
        paymentStatus: 'pending',
        paymentMethod: 'Cash on Delivery',
        paymentDate: new Date('2024-11-23 17:20:00')
      },
      {
        customer_id: 9,
        dealer_id: 3,
        orderDate: new Date('2024-11-24 13:10:00'),
        orderStatus: 'processing',
        totalAmount: 245.80,
        shippingCost: 18.00,
        deliveryAddress: '369 Spruce Rd, Dallas, TX 75201',
        paymentStatus: 'paid',
        paymentMethod: 'Bank Transfer',
        paymentDate: new Date('2024-11-24 13:10:00')
      },
      {
        customer_id: 10,
        dealer_id: 5,
        orderDate: new Date('2024-11-25 10:50:00'),
        orderStatus: 'shipped',
        totalAmount: 112.40,
        shippingCost: 9.00,
        deliveryAddress: '741 Ash Dr, San Jose, CA 95101',
        paymentStatus: 'paid',
        paymentMethod: 'PayPal',
        paymentDate: new Date('2024-11-25 10:50:00')
      },
      {
        customer_id: 2,
        dealer_id: 2,
        orderDate: new Date('2024-11-26 14:15:00'),
        orderStatus: 'delivered',
        totalAmount: 89.99,
        shippingCost: 8.00,
        deliveryAddress: '456 Oak Ave, Los Angeles, CA 90001',
        paymentStatus: 'paid',
        paymentMethod: 'Credit Card',
        paymentDate: new Date('2024-11-26 14:15:00')
      },
      {
        customer_id: 6,
        dealer_id: 6,
        orderDate: new Date('2024-11-27 11:25:00'),
        orderStatus: 'cancelled',
        totalAmount: 156.30,
        shippingCost: 13.00,
        deliveryAddress: '987 Cedar Ln, Philadelphia, PA 19019',
        paymentStatus: 'refunded',
        paymentMethod: 'PayPal',
        paymentDate: new Date('2024-11-27 11:25:00')
      },
      {
        customer_id: 1,
        dealer_id: 6,
        orderDate: new Date('2024-11-28 09:40:00'),
        orderStatus: 'processing',
        totalAmount: 203.60,
        shippingCost: 17.00,
        deliveryAddress: '123 Main St, New York, NY 10001',
        paymentStatus: 'paid',
        paymentMethod: 'Credit Card',
        paymentDate: new Date('2024-11-28 09:40:00')
      }
    ], {});
  }

 export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkDelete('orders', {}, {});
}