// Dependencies
import sequelize from "../../src/util/db.js";

// Models
import { Note, User, Team, Membership, UserNotes } from "../../src/models/index.js";

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
  await UserNotes.drop();
  await Membership.drop();
  await Team.drop();
  await Note.drop();
  await User.drop();
  await sequelize.close();
}
