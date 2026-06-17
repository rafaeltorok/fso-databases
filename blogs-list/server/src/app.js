// Dependencies
import express from "express";

// Routes
import blogsRouter from "./controllers/blogs.js";
import userRouter from "./controllers/users.js";
import loginRouter from "./controllers/login.js";
import healthRouter from "./controllers/health.js";
import testsRouter from "./controllers/tests.js";
import authorsRouter from "./controllers/authors.js";

// Middleware
import errorHandler from "./middleware/errorHandler.js";

// Express server setup
const app = express();

app.use(express.json());
app.use("/api/blogs", blogsRouter);
app.use("/api/users", userRouter);
app.use("/api/login", loginRouter);
app.use("/api/health", healthRouter);
app.use("/api/authors", authorsRouter);
app.use("/", async (req, res) => {
  return res.status(200).end();
});

if (process.env.NODE_ENV === "test") {
  app.use("/api", testsRouter);
}

app.use(errorHandler);

export default app;
