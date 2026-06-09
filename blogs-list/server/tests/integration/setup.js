import sequelize from "../../src/utils/connectdb.js";

export async function setupDb() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
}

export async function dbCleanup() {
  await sequelize.close();
}
