'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Purchase_Order_Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Purchase_Order_Item.init({
    pot_quantityOrdered: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'Purchase_Order_Item',
  });
  return Purchase_Order_Item;
};