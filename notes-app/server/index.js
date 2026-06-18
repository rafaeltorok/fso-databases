// Express
import express from "express";
const app = express();

// Utils
import { PORT } from "./util/config.js";
import { sequelize } from "./util/db.js";
import runMigrations from "./util/migrations.js";

// Controllers
import notesRouter from "./controllers/notes.js";
import usersRouter from "./controllers/users.js";
import loginRouter from "./controllers/login.js";
import healthRouter from "./controllers/health.js";

app.use(express.json());

// Routes
app.use("/api/notes", notesRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);
app.use("/api/health", healthRouter);

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
