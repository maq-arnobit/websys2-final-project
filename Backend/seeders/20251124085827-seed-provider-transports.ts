'use strict';
import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkInsert('provider_transports', [
    { provider_id: 1, transportMethod: 'Air Freight Express', transportCost: 500.00, costPerKG: 15.50 },
    { provider_id: 1, transportMethod: 'Sea Freight Standard', transportCost: 200.00, costPerKG: 5.00 },
    { provider_id: 1, transportMethod: 'Rail Freight Economy', transportCost: 150.00, costPerKG: 3.75 },

    { provider_id: 2, transportMethod: 'Ground Delivery', transportCost: 100.00, costPerKG: 3.50 },
    { provider_id: 2, transportMethod: 'Express Truck', transportCost: 250.00, costPerKG: 8.00 },
    { provider_id: 2, transportMethod: 'Same Day Delivery', transportCost: 400.00, costPerKG: 12.00 },

    { provider_id: 3, transportMethod: 'Premium Air', transportCost: 750.00, costPerKG: 20.00 },
    { provider_id: 3, transportMethod: 'Standard Ground', transportCost: 150.00, costPerKG: 4.50 },

    { provider_id: 4, transportMethod: 'Economy Shipping', transportCost: 75.00, costPerKG: 2.50 },
    { provider_id: 4, transportMethod: 'Bulk Transport', transportCost: 50.00, costPerKG: 1.80 },

    { provider_id: 5, transportMethod: 'International Express', transportCost: 850.00, costPerKG: 22.00 },
    { provider_id: 5, transportMethod: 'Ocean Container', transportCost: 300.00, costPerKG: 6.50 },

    { provider_id: 6, transportMethod: 'Refrigerated Truck', transportCost: 350.00, costPerKG: 10.00 },
    { provider_id: 6, transportMethod: 'Standard Delivery', transportCost: 125.00, costPerKG: 4.00 },
  ]);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkDelete('provider_transports', {}, {});
}
