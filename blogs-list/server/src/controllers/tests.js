// Dependencies
import express from "express";

// Models
import Blog from "../models/blog";
import User from "../models/user";

const testsRouter = express.Router();

// Routes
testsRouter.post("/reset", async (req, res, next) => {
  try {
    await Blog.destroy();
    await User.destroy();

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default testsRouter;
