'use strict';
import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('provider_transports', {
    providerTransport_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    provider_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'providers',
        key: 'provider_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    transportMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    transportCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    costPerKG: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('provider_transports');
}
