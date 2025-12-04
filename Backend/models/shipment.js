'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Shipment extends Model {
    static associate(models) {
      this.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order'
      });
    }
  }
  
  Shipment.init({
    shipment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    carrier: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.ENUM('preparing', 'in_transit', 'delivered', 'failed'),
      defaultValue: 'preparing'
    }
  }, {
    sequelize,
    modelName: 'Shipment',
    tableName: 'shipments',
    timestamps: false
  });
  
  return Shipment;
};