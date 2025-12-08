'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('providers', [
      {
        provider_id: 1,
        username: 'global_imports',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        email: 'contact@globalimports.com',
        businessName: 'Global Imports LLC',
        status: 'active'
      },
      {
        provider_id: 2,
        username: 'local_source',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        email: 'info@localsource.com',
        businessName: 'Local Source Co.',
        status: 'active'
      },
      {
        provider_id: 3,
        username: 'premium_supply',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        email: 'sales@premiumsupply.com',
        businessName: 'Premium Supply Inc.',
        status: 'active'
      },
      {
        provider_id: 4,
        username: 'budget_wholesale',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        email: 'orders@budgetwholesale.com',
        businessName: 'Budget Wholesale Ltd.',
        status: 'inactive'
      },
      {
        provider_id: 5,
        username: 'international_traders',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        email: 'trade@international.com',
        businessName: 'International Traders Group',
        status: 'active'
      },
      {
        provider_id: 6,
        username: 'organic_sources',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        email: 'hello@organicsources.com',
        businessName: 'Organic Sources & Co.',
        status: 'active'
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('providers', null, {});
  }
};