'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProviderTransport extends Model {
    static associate(models) {
      this.belongsTo(models.Provider, {
        foreignKey: 'provider_id',
        as: 'provider'
      });
      this.hasMany(models.PurchaseOrder, {
        foreignKey: 'providerTransport_id',
        as: 'purchaseOrders'
      });
    }
  }
  
  ProviderTransport.init({
    providerTransport_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    provider_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    transportMethod: {
      type: DataTypes.STRING,
      allowNull: false
    },
    transportCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    costPerKG: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ProviderTransport',
    tableName: 'provider_transports',
    timestamps: false
  });
  
  return ProviderTransport;
};
