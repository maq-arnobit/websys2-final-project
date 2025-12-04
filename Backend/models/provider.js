'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Provider extends Model {
    static associate(models) {
      this.hasMany(models.Substance, {
        foreignKey: 'provider_id',
        as: 'substances'
      });
      this.hasMany(models.ProviderTransport, {
        foreignKey: 'provider_id',
        as: 'transportOptions'
      });
      this.hasMany(models.PurchaseOrder, {
        foreignKey: 'provider_id',
        as: 'purchaseOrders'
      });
    }
  }
  
  Provider.init({
    provider_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    }
  }, {
    sequelize,
    modelName: 'Provider',
    tableName: 'providers',
    timestamps: false
  });
  
  return Provider;
};
