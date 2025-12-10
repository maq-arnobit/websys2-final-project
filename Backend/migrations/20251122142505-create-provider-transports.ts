'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('provider_transports', {
      providerTransport_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
      transportMethod: {
        type: Sequelize.STRING,
        allowNull: false
      },
      transportCost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      costPerKG: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('provider_transports');
  }
};
