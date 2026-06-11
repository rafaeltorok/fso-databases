// Dependencies
import sequelize from "../../src/utils/connectdb.js";

// Models
import Blog from "../../src/models/blog.js";
import User from "../../src/models/user.js";

// Generates all tables inside the database
export async function setupDb() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
}

// Close the connection and clears all data
export async function dbCleanup() {
  await Blog.truncate({ restartIdentity: true, cascade: true });
  await User.truncate({ restartIdentity: true, cascade: true });
  await sequelize.close();
}
