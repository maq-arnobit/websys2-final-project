'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      order_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'customer_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      orderDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      orderStatus: {
        type: Sequelize.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending'
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      shippingCost: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      deliveryAddress: {
        type: Sequelize.STRING
      },
      paymentStatus: {
        type: Sequelize.ENUM('pending', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('orders');
  }
};
