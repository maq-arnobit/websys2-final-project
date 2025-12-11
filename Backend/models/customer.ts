import { Model } from 'sequelize';

export default (sequelize: any, DataTypes: any) => {
  class Customer extends Model {
    static associate(models: any) {
      this.hasMany(models.Order, { foreignKey: 'customer_id', as: 'orders' });
    }
  }

  Customer.init(
    {
      customer_id: { 
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
      address: { 
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
        validate: { isEmail: true } 
      },
    },
    {
      sequelize,
      modelName: 'Customer',
      tableName: 'customers',
      timestamps: false,
    }
  );

  return Customer;
};
