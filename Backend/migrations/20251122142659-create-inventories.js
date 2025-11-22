'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventories', {
      inventory_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      dealer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'dealers',
          key: 'dealer_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      substance_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'substances',
          key: 'substance_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantityAvailable: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      warehouse: {
        type: Sequelize.STRING
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('inventories');
  }
};