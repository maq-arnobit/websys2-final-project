'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Substance extends Model {
    static associate(models) {
      this.belongsTo(models.Provider, {
        foreignKey: 'provider_id',
        as: 'provider'
      });
      this.hasMany(models.Inventory, {
        foreignKey: 'substance_id',
        as: 'inventoryItems'
      });
      this.hasMany(models.OrderItem, {
        foreignKey: 'substance_id',
        as: 'orderItems'
      });
      this.hasMany(models.PurchaseOrderItem, {
        foreignKey: 'substance_id',
        as: 'purchaseOrderItems'
      });
    }
  }
  
  Substance.init({
    substance_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    provider_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    substanceName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Substance',
    tableName: 'substances',
    timestamps: false
  });
  
  return Substance;
};