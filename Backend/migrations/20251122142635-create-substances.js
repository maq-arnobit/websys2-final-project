'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('substances', {
      substance_id: {
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
      substanceName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      category: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('substances');
  }
};
