import Sequelize from "sequelize";
import { DATABASE_URL } from "./config.js";

let sequelize;

if (process.env.DATABASE_SSL === "true") {
  // SSL is required for remote databases
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else if (process.env.DATABASE_SSL === "false") {
  // Disable SSL connections for the Docker orchestrations
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: false,
    },
  });
} else {
  throw new Error("The DATABASE_SSL env variable must be set to either true or false");
}

export default sequelize;
