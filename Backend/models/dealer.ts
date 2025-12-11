'use strict';
import { Model,DataTypes } from 'sequelize';

export default (sequelize: any, DataTypes: any) => {
  class Dealer extends Model {
    static associate(models) {
      this.hasMany(models.Order, {
        foreignKey: 'dealer_id',
        as: 'orders'
      });
      this.hasMany(models.Inventory, {
        foreignKey: 'dealer_id',
        as: 'inventory'
      });
      this.hasMany(models.PurchaseOrder, {
        foreignKey: 'dealer_id',
        as: 'purchaseOrders'
      });
    }
  }
  
  Dealer.init({
    dealer_id: {
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
    warehouse: {
      type: DataTypes.STRING
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
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00,
      validate: {
        min: 0,
        max: 5
      }
    }
  }, {
    sequelize,
    modelName: 'Dealer',
    tableName: 'dealers',
    timestamps: false
  });
  
  return Dealer;
};
