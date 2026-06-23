// Express
import express from "express";
const app = express();

// Middleware
import errorHandler from "./middleware/errorHandler.js";

// Controllers
import notesRouter from "./controllers/notes.js";
import usersRouter from "./controllers/users.js";
import loginRouter from "./controllers/login.js";
import healthRouter from "./controllers/health.js";
import testsRouter from "./controllers/tests.js";
import teamsRouter from "./controllers/teams.js";

app.use(express.json());

// Routes
app.use("/api/notes", notesRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/health", healthRouter);

if (process.env.NODE_ENV === "test") {
  app.use("/api/reset", testsRouter);
}

app.use(errorHandler);

export default app;
