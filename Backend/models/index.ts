import { Sequelize, DataTypes } from "sequelize";
import fs from "fs";
import path from "path";

const sequelize = new Sequelize(
  "postgres", 
  "postgres.fexgenuaqawdslabpifp", 
  "Password67!", 
  {
    host: "aws-1-ap-southeast-2.pooler.supabase.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
  }
);

const db: any = {};
const basename = path.basename(__filename);

fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file !== basename &&
      (file.endsWith(".js") || file.endsWith(".ts")) &&
      !file.endsWith(".d.ts") &&
      !file.endsWith(".map")
    );
  })
  .forEach(file => {
    const modelPath = path.join(__dirname, file);
    const modelModule = require(modelPath);

    const modelFactory = modelModule.default || modelModule;

    if (typeof modelFactory !== "function") {
      console.warn(`Skipping ${file} (not a model factory)`);
      return;
    }

    const model = modelFactory(sequelize, DataTypes);
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
