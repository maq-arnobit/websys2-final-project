'use strict';
import { Model } from 'sequelize';

export default (sequelize: any, DataTypes: any) => {
  class OrderItem extends Model {
    static associate(models: any) {
      this.belongsTo(models.Order, {
        foreignKey: 'order_id',
        as: 'order',
      });

      this.belongsTo(models.Substance, {
        foreignKey: 'substance_id',
        as: 'substance',
      });
    }
  }

  OrderItem.init(
    {
      orderItem_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      substance_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      subTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'OrderItem',
      tableName: 'order_items',
      timestamps: false,
    }
  );

  return OrderItem;
};
