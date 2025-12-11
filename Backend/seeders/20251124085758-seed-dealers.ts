'use strict';
import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkInsert('dealers', [
    {
      username: 'mega_dealer',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      email: 'mega@dealer.com',
      warehouse: 'Warehouse A - Downtown Distribution Center',
      status: 'active',
      rating: 4.85,
    },
    {
      username: 'prime_supplier',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      email: 'prime@supplier.com',
      warehouse: 'Warehouse B - North Industrial Park',
      status: 'active',
      rating: 4.72,
    },
    {
      username: 'quick_trade',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      email: 'quick@trade.com',
      warehouse: 'Warehouse C - East Side Logistics Hub',
      status: 'active',
      rating: 4.55,
    },
    {
      username: 'reliable_dealer',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      email: 'reliable@dealer.com',
      warehouse: 'Warehouse D - West End Storage',
      status: 'suspended',
      rating: 3.92,
    },
    {
      username: 'express_wholesale',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      email: 'express@wholesale.com',
      warehouse: 'Warehouse E - South Commercial District',
      status: 'active',
      rating: 4.68,
    },
    {
      username: 'direct_supply',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      email: 'direct@supply.com',
      warehouse: 'Warehouse F - Central Business Area',
      status: 'active',
      rating: 4.41,
    },
  ]);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkDelete('dealers', {}, {});
}
