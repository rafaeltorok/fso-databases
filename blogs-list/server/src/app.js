// Dependencies
import express from "express";

// Routes
import blogsRouter from "./controllers/blogs.js";
import healthRouter from "./controllers/health.js";

// Utils
import sequelize from "./utils/connectdb.js";
import { errorHandler } from "./utils/middleware.js";

// Connect to the PostgreSQL database
async function connectToDb() {
  try {
    await sequelize.authenticate();
  } catch (err) {
    console.error("Unable to connect to the database", err);
  }
}
connectToDb();

// Express server setup
const app = express();

app.use(express.json());
app.use("/api/blogs", blogsRouter);
app.use("/api/health", healthRouter);

app.use(errorHandler);

export default app;
