'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      this.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order'
      });
      this.belongsTo(models.PurchaseOrder, {
        foreignKey: 'purchaseOrder_id',
        as: 'purchaseOrder'
      });
    }
  }
  
  Transaction.init({
    transaction_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
      type: DataTypes.INTEGER
    },
    purchaseOrder_id: {
      type: DataTypes.INTEGER
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    paymentMethod: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending'
    }
  }, {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
    timestamps: false
  });
  
  return Transaction;
};