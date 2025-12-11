'use strict';
import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('shipments', {
    shipment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'orders',
        key: 'order_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    carrier: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('preparing', 'in_transit', 'delivered', 'failed'),
      defaultValue: 'preparing',
    },
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('shipments');
}
