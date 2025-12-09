'use strict';
import { Model,DataTypes,Optional } from 'sequelize';

export default (sequelize: any, DataTypes: any) => {
  class PurchaseOrder extends Model {
    static associate(models) {
      this.belongsTo(models.Dealer, {
        foreignKey: 'dealer_id',
        as: 'dealer'
      });
      this.belongsTo(models.Provider, {
        foreignKey: 'provider_id',
        as: 'provider'
      });
      this.belongsTo(models.ProviderTransport, {
        foreignKey: 'providerTransport_id',
        as: 'transport'
      });
      this.belongsTo(models.Substance, {
        foreignKey: 'substance_id',
        as: 'substance'
      });
    }
  }
  
  PurchaseOrder.init({
    purchaseOrder_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    dealer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    provider_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    substance_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    providerTransport_id: {
      type: DataTypes.INTEGER
    },
    quantityOrdered: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    unitCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    transportCost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    orderDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    paymentStatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
     paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false
    },

  }, {
    sequelize,
    modelName: 'PurchaseOrder',
    tableName: 'purchase_orders',
    timestamps: false
  });
  
  return PurchaseOrder;
};