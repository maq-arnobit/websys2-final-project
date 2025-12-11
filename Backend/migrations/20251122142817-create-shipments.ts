'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('shipments', {
      shipment_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'orders',
          key: 'order_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      carrier: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('preparing', 'in_transit', 'delivered', 'failed'),
        defaultValue: 'preparing'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('shipments');
  }
};
