// Express
import express from "express";
const app = express();

// Utils
import { PORT } from "./util/config.js";
import { connectToDatabase } from "./util/db.js";

// Controllers
import notesRouter from "./controllers/notes.js";
import usersRouter from "./controllers/users.js";
import loginRouter from "./controllers/login.js";

app.use(express.json());

app.use("/api/notes", notesRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);

// Start the Express Server
const start = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
