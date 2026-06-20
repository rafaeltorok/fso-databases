// Dependencies
import app from "./src/app.js";

// Utils
import { PORT } from "./src/util/config.js";
import sequelize from "./src/util/db.js";
import { runMigrations } from "./src/util/migrations.js";

// Start the Express Server
const start = async () => {
  try {
    await sequelize.authenticate();
    await runMigrations();
    console.log("database connected");
  } catch (err) {
    console.log("connecting database failed:", err);
    return process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
