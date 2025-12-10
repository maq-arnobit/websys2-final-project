'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customers', {
      customer_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active'
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('customers');
  }
};