'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('dealers', [
      {
        dealer_id: 1,
        username: 'mega_dealer',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        email: 'mega@dealer.com',
        warehouse: 'Warehouse A - Downtown Distribution Center',
        status: 'active',
        rating: 4.85
      },
      {
        dealer_id: 2,
        username: 'prime_supplier',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        email: 'prime@supplier.com',
        warehouse: 'Warehouse B - North Industrial Park',
        status: 'active',
        rating: 4.72
      },
      {
        dealer_id: 3,
        username: 'quick_trade',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        email: 'quick@trade.com',
        warehouse: 'Warehouse C - East Side Logistics Hub',
        status: 'active',
        rating: 4.55
      },
      {
        dealer_id: 4,
        username: 'reliable_dealer',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        email: 'reliable@dealer.com',
        warehouse: 'Warehouse D - West End Storage',
        status: 'suspended',
        rating: 3.92
      },
      {
        dealer_id: 5,
        username: 'express_wholesale',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        email: 'express@wholesale.com',
        warehouse: 'Warehouse E - South Commercial District',
        status: 'active',
        rating: 4.68
      },
      {
        dealer_id: 6,
        username: 'direct_supply',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        email: 'direct@supply.com',
        warehouse: 'Warehouse F - Central Business Area',
        status: 'active',
        rating: 4.41
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('dealers', null, {});
  }
};