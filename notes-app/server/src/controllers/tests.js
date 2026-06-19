// Dependencies
import express from "express";

// Models
import Note from "../models/note.js";
import User from "../models/user.js";

const testsRouter = express.Router();

// Routes
testsRouter.post("/", async (req, res, next) => {
  try {
    await Note.truncate({ restartIdentity: true, cascade: true });
    await User.truncate({ restartIdentity: true, cascade: true });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default testsRouter;
