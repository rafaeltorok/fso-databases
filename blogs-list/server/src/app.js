// Dependencies
import express from "express";

// Routes
import blogsRouter from "./controllers/blogs.js";
import healthRouter from "./controllers/health.js";

// Utils
import { errorHandler } from "./utils/middleware.js";

// Express server setup
const app = express();

app.use(express.json());
app.use("/api/blogs", blogsRouter);
app.use("/api/health", healthRouter);

app.use(errorHandler);

export default app;
