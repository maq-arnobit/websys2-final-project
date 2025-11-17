'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Provider_Transport extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Provider_Transport.init({
    pt_transportMethod: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Provider_Transport',
  });
  return Provider_Transport;
};