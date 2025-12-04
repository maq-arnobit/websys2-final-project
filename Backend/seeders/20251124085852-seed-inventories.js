'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('inventories', [
      // Mega Dealer inventory
      {
        inventory_id: 1,
        dealer_id: 1,
        substance_id: 1,
        quantityAvailable: 500,
        warehouse: 'Warehouse A - Downtown Distribution Center'
      },
      {
        inventory_id: 2,
        dealer_id: 1,
        substance_id: 2,
        quantityAvailable: 350,
        warehouse: 'Warehouse A - Downtown Distribution Center'
      },
      {
        inventory_id: 3,
        dealer_id: 1,
        substance_id: 5,
        quantityAvailable: 200,
        warehouse: 'Warehouse A - Downtown Distribution Center'
      },
      {
        inventory_id: 4,
        dealer_id: 1,
        substance_id: 9,
        quantityAvailable: 150,
        warehouse: 'Warehouse A - Downtown Distribution Center'
      },
      {
        inventory_id: 5,
        dealer_id: 1,
        substance_id: 11,
        quantityAvailable: 180,
        warehouse: 'Warehouse A - Downtown Distribution Center'
      },
      // Prime Supplier inventory
      {
        inventory_id: 6,
        dealer_id: 2,
        substance_id: 3,
        quantityAvailable: 450,
        warehouse: 'Warehouse B - North Industrial Park'
      },
      {
        inventory_id: 7,
        dealer_id: 2,
        substance_id: 6,
        quantityAvailable: 280,
        warehouse: 'Warehouse B - North Industrial Park'
      },
      {
        inventory_id: 8,
        dealer_id: 2,
        substance_id: 7,
        quantityAvailable: 220,
        warehouse: 'Warehouse B - North Industrial Park'
      },
      {
        inventory_id: 9,
        dealer_id: 2,
        substance_id: 10,
        quantityAvailable: 120,
        warehouse: 'Warehouse B - North Industrial Park'
      },
      {
        inventory_id: 10,
        dealer_id: 2,
        substance_id: 15,
        quantityAvailable: 95,
        warehouse: 'Warehouse B - North Industrial Park'
      },
      // Quick Trade inventory
      {
        inventory_id: 11,
        dealer_id: 3,
        substance_id: 4,
        quantityAvailable: 300,
        warehouse: 'Warehouse C - East Side Logistics Hub'
      },
      {
        inventory_id: 12,
        dealer_id: 3,
        substance_id: 8,
        quantityAvailable: 250,
        warehouse: 'Warehouse C - East Side Logistics Hub'
      },
      {
        inventory_id: 13,
        dealer_id: 3,
        substance_id: 12,
        quantityAvailable: 140,
        warehouse: 'Warehouse C - East Side Logistics Hub'
      },
      {
        inventory_id: 14,
        dealer_id: 3,
        substance_id: 16,
        quantityAvailable: 110,
        warehouse: 'Warehouse C - East Side Logistics Hub'
      },
      // Reliable Dealer inventory (suspended but has stock)
      {
        inventory_id: 15,
        dealer_id: 4,
        substance_id: 13,
        quantityAvailable: 600,
        warehouse: 'Warehouse D - West End Storage'
      },
      {
        inventory_id: 16,
        dealer_id: 4,
        substance_id: 14,
        quantityAvailable: 450,
        warehouse: 'Warehouse D - West End Storage'
      },
      // Express Wholesale inventory
      {
        inventory_id: 17,
        dealer_id: 5,
        substance_id: 17,
        quantityAvailable: 320,
        warehouse: 'Warehouse E - South Commercial District'
      },
      {
        inventory_id: 18,
        dealer_id: 5,
        substance_id: 18,
        quantityAvailable: 190,
        warehouse: 'Warehouse E - South Commercial District'
      },
      {
        inventory_id: 19,
        dealer_id: 5,
        substance_id: 19,
        quantityAvailable: 210,
        warehouse: 'Warehouse E - South Commercial District'
      },
      {
        inventory_id: 20,
        dealer_id: 5,
        substance_id: 20,
        quantityAvailable: 170,
        warehouse: 'Warehouse E - South Commercial District'
      },
      // Direct Supply inventory
      {
        inventory_id: 21,
        dealer_id: 6,
        substance_id: 1,
        quantityAvailable: 280,
        warehouse: 'Warehouse F - Central Business Area'
      },
      {
        inventory_id: 22,
        dealer_id: 6,
        substance_id: 3,
        quantityAvailable: 330,
        warehouse: 'Warehouse F - Central Business Area'
      },
      {
        inventory_id: 23,
        dealer_id: 6,
        substance_id: 5,
        quantityAvailable: 240,
        warehouse: 'Warehouse F - Central Business Area'
      },
      {
        inventory_id: 24,
        dealer_id: 6,
        substance_id: 9,
        quantityAvailable: 160,
        warehouse: 'Warehouse F - Central Business Area'
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('inventories', null, {});
  }
};