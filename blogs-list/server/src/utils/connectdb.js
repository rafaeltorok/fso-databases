import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { DATABASE_URL } from "./config.js";
dotenv.config();

let sequelize;

if (process.env.DEPLOYMENT === "docker") {
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: false
    },
  });
} else {
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
}

export default sequelize;
