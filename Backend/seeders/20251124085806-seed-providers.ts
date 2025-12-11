'use strict';
import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkInsert('providers', [
    {
      username: 'global_imports',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      email: 'contact@globalimports.com',
      businessName: 'Global Imports LLC',
      status: 'active',
    },
    {
      username: 'local_source',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      email: 'info@localsource.com',
      businessName: 'Local Source Co.',
      status: 'active',
    },
    {
      username: 'premium_supply',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      email: 'sales@premiumsupply.com',
      businessName: 'Premium Supply Inc.',
      status: 'active',
    },
    {
      username: 'budget_wholesale',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      email: 'orders@budgetwholesale.com',
      businessName: 'Budget Wholesale Ltd.',
      status: 'inactive',
    },
    {
      username: 'international_traders',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      email: 'trade@international.com',
      businessName: 'International Traders Group',
      status: 'active',
    },
    {
      username: 'organic_sources',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      email: 'hello@organicsources.com',
      businessName: 'Organic Sources & Co.',
      status: 'active',
    },
  ]);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkDelete('providers', {}, {});
}
