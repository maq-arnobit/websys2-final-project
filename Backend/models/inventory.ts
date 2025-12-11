'use strict';
import { Model } from 'sequelize';

export default (sequelize: any, DataTypes: any) => {
  class Inventory extends Model {
    static associate(models: any) {
      this.belongsTo(models.Dealer, {
        foreignKey: 'dealer_id',
        as: 'dealer',
      });

      this.belongsTo(models.Substance, {
        foreignKey: 'substance_id',
        as: 'substance',
      });
    }
  }

  Inventory.init(
    {
      inventory_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      dealer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      substance_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantityAvailable: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      warehouse: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'Inventory',
      tableName: 'inventories',
      timestamps: false,
    }
  );

  return Inventory;
};
