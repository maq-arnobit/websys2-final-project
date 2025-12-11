'use strict';
import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('order_items', {
    orderItem_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'order_id',
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
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    subTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('order_items');
}
