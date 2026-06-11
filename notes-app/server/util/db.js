import Sequelize from "sequelize";
import { DATABASE_URL } from "./config.js";

export const sequelize = new Sequelize(DATABASE_URL, {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

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
