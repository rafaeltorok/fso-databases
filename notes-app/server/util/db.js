import Sequelize from "sequelize";
import { DATABASE_URL } from "./config.js";

export let sequelize;

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
  throw new Error({ error: "The DATABASE_SSL env variable must be set to either true or false" });
}

export const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("database connected");
  } catch (err) {
    console.log("connecting database failed:", err);
    return process.exit(1);
  }

  return null;
};
