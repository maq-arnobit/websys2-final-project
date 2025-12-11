'use strict';
import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('dealers', {
    dealer_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    warehouse: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active',
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.0,
      validate: {
        min: 0,
        max: 5,
      },
    },
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('dealers');
}
