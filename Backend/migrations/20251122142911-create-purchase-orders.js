'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('purchase_orders', {
      purchaseOrder_id: {
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
      provider_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'providers',
          key: 'provider_id'
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
      providerTransport_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'provider_transports',
          key: 'providerTransport_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      quantityOrdered: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      unitCost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      transportCost: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      totalCost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      orderDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      paymentStatus: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      paymentMethod: {
        type: Sequelize.STRING,
        allowNull: false
      },
      paymentDate: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('purchase_orders');
  }
};