'use strict';
import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkInsert('inventories', [
    { dealer_id: 1, substance_id: 1, quantityAvailable: 500, warehouse: 'Warehouse A - Downtown Distribution Center' },
    { dealer_id: 1, substance_id: 2, quantityAvailable: 350, warehouse: 'Warehouse A - Downtown Distribution Center' },
    { dealer_id: 1, substance_id: 5, quantityAvailable: 200, warehouse: 'Warehouse A - Downtown Distribution Center' },
    { dealer_id: 1, substance_id: 9, quantityAvailable: 150, warehouse: 'Warehouse A - Downtown Distribution Center' },
    { dealer_id: 1, substance_id: 11, quantityAvailable: 180, warehouse: 'Warehouse A - Downtown Distribution Center' },

    { dealer_id: 2, substance_id: 3, quantityAvailable: 450, warehouse: 'Warehouse B - North Industrial Park' },
    { dealer_id: 2, substance_id: 6, quantityAvailable: 280, warehouse: 'Warehouse B - North Industrial Park' },
    { dealer_id: 2, substance_id: 7, quantityAvailable: 220, warehouse: 'Warehouse B - North Industrial Park' },
    { dealer_id: 2, substance_id: 10, quantityAvailable: 120, warehouse: 'Warehouse B - North Industrial Park' },
    { dealer_id: 2, substance_id: 15, quantityAvailable: 95, warehouse: 'Warehouse B - North Industrial Park' },

    { dealer_id: 3, substance_id: 4, quantityAvailable: 300, warehouse: 'Warehouse C - East Side Logistics Hub' },
    { dealer_id: 3, substance_id: 8, quantityAvailable: 250, warehouse: 'Warehouse C - East Side Logistics Hub' },
    { dealer_id: 3, substance_id: 12, quantityAvailable: 140, warehouse: 'Warehouse C - East Side Logistics Hub' },
    { dealer_id: 3, substance_id: 16, quantityAvailable: 110, warehouse: 'Warehouse C - East Side Logistics Hub' },

    { dealer_id: 4, substance_id: 13, quantityAvailable: 600, warehouse: 'Warehouse D - West End Storage' },
    { dealer_id: 4, substance_id: 14, quantityAvailable: 450, warehouse: 'Warehouse D - West End Storage' },

    { dealer_id: 5, substance_id: 17, quantityAvailable: 320, warehouse: 'Warehouse E - South Commercial District' },
    { dealer_id: 5, substance_id: 18, quantityAvailable: 190, warehouse: 'Warehouse E - South Commercial District' },
    { dealer_id: 5, substance_id: 19, quantityAvailable: 210, warehouse: 'Warehouse E - South Commercial District' },
    { dealer_id: 5, substance_id: 20, quantityAvailable: 170, warehouse: 'Warehouse E - South Commercial District' },

    { dealer_id: 6, substance_id: 1, quantityAvailable: 280, warehouse: 'Warehouse F - Central Business Area' },
    { dealer_id: 6, substance_id: 3, quantityAvailable: 330, warehouse: 'Warehouse F - Central Business Area' },
    { dealer_id: 6, substance_id: 5, quantityAvailable: 240, warehouse: 'Warehouse F - Central Business Area' },
    { dealer_id: 6, substance_id: 9, quantityAvailable: 160, warehouse: 'Warehouse F - Central Business Area' }
  ], {});
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkDelete('inventories', {}, {});
}
