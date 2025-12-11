'use strict';
import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('orders', {
    order_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'customer_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
    orderDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    orderStatus: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'pending',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    shippingCost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    deliveryAddress: {
      type: DataTypes.STRING,
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending',
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('orders');
}
