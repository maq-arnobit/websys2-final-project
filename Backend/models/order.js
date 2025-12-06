'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      this.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'customer'
      });
      this.belongsTo(models.Dealer, {
        foreignKey: 'dealer_id',
        as: 'dealer'
      });
      this.hasMany(models.OrderItem, {
        foreignKey: 'order_id',
        as: 'items'
      });
      this.hasOne(models.Shipment, {
        foreignKey: 'order_id',
        as: 'shipment'
      });
    }
  }
  
  Order.init({
    order_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dealer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    orderDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    orderStatus: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'pending'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    shippingCost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    deliveryAddress: {
      type: DataTypes.STRING
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending'
    },
    paymentMethod: {
      type: DataTypes.STRING  
    },
    paymentDate: {
      type: DataTypes.DATE
    },
    //transactionReference: {
     // type: DataTypes.STRING  
    //}
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: false
  });
  
  return Order;
};