'use strict';
import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('inventories', {
    inventory_id: {
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
    quantityAvailable: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    warehouse: {
      type: DataTypes.STRING,
    },
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('inventories');
}
