// Dependencies
import express from "express";

// Routes
import blogsRouter from "./controllers/blogs.js";
import userRouter from "./controllers/users.js";
import loginRouter from "./controllers/login.js";
import healthRouter from "./controllers/health.js";

// Middleware
import { errorHandler } from "./utils/middleware.js";

// Express server setup
const app = express();

app.use(express.json());
app.use("/api/blogs", blogsRouter);
app.use("/api/users", userRouter);
app.use("/api/login", loginRouter);
app.use("/api/health", healthRouter);

app.use(errorHandler);

export default app;
