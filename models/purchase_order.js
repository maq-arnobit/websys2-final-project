'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Purchase_Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Purchase_Order.init({
    po_orderDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Purchase_Order',
  });
  return Purchase_Order;
};