'use strict';
import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('purchase_orders', {
    purchaseOrder_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    dealer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'dealers',
        key: 'dealer_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
    substance_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'substances',
        key: 'substance_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    providerTransport_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'provider_transports',
        key: 'providerTransport_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    quantityOrdered: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    unitCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    transportCost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    orderDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    paymentStatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('purchase_orders');
}
