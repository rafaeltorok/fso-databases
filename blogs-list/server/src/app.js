// Dependencies
import express from "express";
import { Sequelize } from "sequelize";

// Routes
import blogsRouter from "./controllers/blogs.js";
import healthRouter from "./controllers/health.js";

// Utils
import { DATABASE_URL } from "./utils/config.js";
import { errorHandler } from "./utils/middleware.js";

const app = express();

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

async function connectToDb() {
  try {
    await sequelize.authenticate();
  } catch (err) {
    console.error("Unable to connect to the database", err);
  }
}

connectToDb();

app.use(express.json());
app.use("/api/blogs", blogsRouter);
app.use("/api/health", healthRouter);

app.use(errorHandler);

export default app;
