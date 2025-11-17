'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Orders_Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Orders_Item.init({
    oi_quantity: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'Orders_Item',
  });
  return Orders_Item;
};