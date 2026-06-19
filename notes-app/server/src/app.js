// Express
import express from "express";
const app = express();

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

export default app;
