'use strict';
const  Model  = require('sequelize');

export default (sequelize: any, DataTypes: any) => {
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