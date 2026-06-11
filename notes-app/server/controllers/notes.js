// Dependencies
import express from "express";

// Models
import { Note, User } from "../models/index.js";

// Middleware
import { tokenExtractor, noteFinder } from "../util/middleware.js";

const notesRouter = express.Router();

// Routes
notesRouter.get("/", async (req, res) => {
  const notes = await Note.findAll({
    attributes: { exclude: ["userId"] },
    include: {
      model: User,
      attributes: ["name"],
    },
  });
  res.json(notes);
});

notesRouter.post("/", tokenExtractor, async (req, res) => {
  try {
    const user = await User.findByPk(req.decodedToken.id);
    const note = await Note.create({
      ...req.body,
      userId: user.id,
      date: new Date(),
    });
    res.json(note);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
});

notesRouter.get("/:id", noteFinder, async (req, res) => {
  if (req.note) {
    res.json(req.note);
  } else {
    res.status(404).end();
  }
});

notesRouter.delete("/:id", noteFinder, tokenExtractor, async (req, res) => {
  if (req.note) {
    await User.findByPk(req.decodedToken.id);

    await req.note.destroy();
  }
  res.status(204).end();
});

notesRouter.put("/:id", noteFinder, tokenExtractor, async (req, res) => {
  if (req.note) {
    await User.findByPk(req.decodedToken.id);

    req.note.important = req.body.important;
    await req.note.save();
    res.json(req.note);
  } else {
    res.status(404).end();
  }
});

export default notesRouter;
