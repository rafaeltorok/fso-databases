// Dependencies
import express from "express";

// Models
import Blog from "../models/blog.js";
import User from "../models/user.js";

const testsRouter = express.Router();

// Routes
testsRouter.post("/reset", async (req, res, next) => {
  try {
    await Blog.truncate({ restartIdentity: true, cascade: true });
    await User.truncate({ restartIdentity: true, cascade: true });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default testsRouter;
