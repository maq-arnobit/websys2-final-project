import { Sequelize, DataTypes } from 'sequelize';
import fs from 'fs';
import path from 'path';

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// Direct configuration - No .env file needed
const sequelize = new Sequelize('your_database_name', 'root', 'your_password', {
  host: 'localhost',
  port: 3306,
  dialect: 'mysql', // or 'postgres', 'sqlite', 'mssql'
  logging: console.log, // or false to disable
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const db: any = {};

// Read all model files
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      (file.slice(-3) === '.ts' || file.slice(-3) === '.js') &&
      file.indexOf('.test.ts') === -1 &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file)).default(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;