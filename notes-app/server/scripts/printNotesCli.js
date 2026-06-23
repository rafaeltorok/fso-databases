import { QueryTypes } from "sequelize";
import sequelize from "../src/util/db.js";

// Helper function - format and print the output
function printNotes(users) {
  for (const user of users) {
    if (user.notes.length > 0) {
      console.log(`\n- "${user.name}" has ${user.notes.length} note(s)`);

      // If a user has any notes, print the list
      for (const note of user.notes) {
        console.log(`   * ${note}`);
      }
    } else {
      console.log(`\n- "${user.name}" has no notes`);
    }
  }
}

// Handle the sequelize authentication and data retrieval
async function main() {
  try {
    await sequelize.authenticate();

    // Initialize the user collection
    const users = [];

    // Fetch the data from the database
    const rows = await sequelize.query(
      "SELECT users.id AS userId, users.name, notes.id AS noteId, notes.content FROM users LEFT JOIN notes ON users.id = notes.user_id;",
      {
        type: QueryTypes.SELECT,
      }
    );

    // Generate an array of objects containing each user with their respective notes
    for (const row of rows) {
      const user = users.find(u => u.name === row.name);

      // If the user is not present yet, add it to the array
      if (!user) {
        users.push({ name: row.name, notes: [] });
      }

      // If there are any notes, append them to the user's notes array
      if (row.content) {
        users.find(u => u.name === row.name).notes.push(row.content);
      }
    }

    printNotes(users);
  } catch (err) {
    console.error(err);
  } finally {
    sequelize.close();
  }
}

main();
