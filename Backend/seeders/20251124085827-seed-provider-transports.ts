'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('provider_transports', [
      // Global Imports transport options
      {
        providerTransport_id: 1,
        provider_id: 1,
        transportMethod: 'Air Freight Express',
        transportCost: 500.00,
        costPerKG: 15.50
      },
      {
        providerTransport_id: 2,
        provider_id: 1,
        transportMethod: 'Sea Freight Standard',
        transportCost: 200.00,
        costPerKG: 5.00
      },
      {
        providerTransport_id: 3,
        provider_id: 1,
        transportMethod: 'Rail Freight Economy',
        transportCost: 150.00,
        costPerKG: 3.75
      },
      // Local Source transport options
      {
        providerTransport_id: 4,
        provider_id: 2,
        transportMethod: 'Ground Delivery',
        transportCost: 100.00,
        costPerKG: 3.50
      },
      {
        providerTransport_id: 5,
        provider_id: 2,
        transportMethod: 'Express Truck',
        transportCost: 250.00,
        costPerKG: 8.00
      },
      {
        providerTransport_id: 6,
        provider_id: 2,
        transportMethod: 'Same Day Delivery',
        transportCost: 400.00,
        costPerKG: 12.00
      },
      // Premium Supply transport options
      {
        providerTransport_id: 7,
        provider_id: 3,
        transportMethod: 'Premium Air',
        transportCost: 750.00,
        costPerKG: 20.00
      },
      {
        providerTransport_id: 8,
        provider_id: 3,
        transportMethod: 'Standard Ground',
        transportCost: 150.00,
        costPerKG: 4.50
      },
      // Budget Wholesale transport options
      {
        providerTransport_id: 9,
        provider_id: 4,
        transportMethod: 'Economy Shipping',
        transportCost: 75.00,
        costPerKG: 2.50
      },
      {
        providerTransport_id: 10,
        provider_id: 4,
        transportMethod: 'Bulk Transport',
        transportCost: 50.00,
        costPerKG: 1.80
      },
      // International Traders transport options
      {
        providerTransport_id: 11,
        provider_id: 5,
        transportMethod: 'International Express',
        transportCost: 850.00,
        costPerKG: 22.00
      },
      {
        providerTransport_id: 12,
        provider_id: 5,
        transportMethod: 'Ocean Container',
        transportCost: 300.00,
        costPerKG: 6.50
      },
      // Organic Sources transport options
      {
        providerTransport_id: 13,
        provider_id: 6,
        transportMethod: 'Refrigerated Truck',
        transportCost: 350.00,
        costPerKG: 10.00
      },
      {
        providerTransport_id: 14,
        provider_id: 6,
        transportMethod: 'Standard Delivery',
        transportCost: 125.00,
        costPerKG: 4.00
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('provider_transports', null, {});
  }
};
