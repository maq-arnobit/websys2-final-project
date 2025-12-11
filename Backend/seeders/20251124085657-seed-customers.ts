'use strict';
import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkInsert('customers', [
      {
        username: 'john_doe',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        email: 'john@example.com',
        address: '123 Main St, New York, NY 10001',
        status: 'active'
      },
      {
        username: 'jane_smith',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        email: 'jane@example.com',
        address: '456 Oak Ave, Los Angeles, CA 90001',
        status: 'active'
      },
      {
        username: 'bob_wilson',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        email: 'bob@example.com',
        address: '789 Pine Rd, Chicago, IL 60601',
        status: 'active'
      },
      {
        username: 'alice_brown',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        email: 'alice@example.com',
        address: '321 Elm St, Houston, TX 77001',
        status: 'inactive'
      },
      {
        username: 'charlie_davis',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        email: 'charlie@example.com',
        address: '654 Maple Dr, Phoenix, AZ 85001',
        status: 'active'
      },
      {
        username: 'emma_johnson',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        email: 'emma@example.com',
        address: '987 Cedar Ln, Philadelphia, PA 19019',
        status: 'active'
      },
      {
        username: 'david_martinez',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        email: 'david@example.com',
        address: '147 Birch St, San Antonio, TX 78201',
        status: 'active'
      },
      {
        username: 'sophia_garcia',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        email: 'sophia@example.com',
        address: '258 Walnut Ave, San Diego, CA 92101',
        status: 'suspended'
      },
      {
        username: 'michael_lee',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        email: 'michael@example.com',
        address: '369 Spruce Rd, Dallas, TX 75201',
        status: 'active'
      },
      {
        username: 'olivia_taylor',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        email: 'olivia@example.com',
        address: '741 Ash Dr, San Jose, CA 95101',
        status: 'active'
      }
    ], {});
};
  export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkDelete('customers', {}, {});
}