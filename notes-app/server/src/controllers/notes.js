// Dependencies
import express from "express";
import { Op } from "sequelize";

// Models
import { Note, User } from "../models/index.js";

// Middleware
import { tokenExtractor, noteFinder } from "../util/middleware.js";

const notesRouter = express.Router();

// Routes
notesRouter.get("/", async (req, res) => {
  const where = {};

  if (req.query.important) {
    where.important = req.query.important === "true";
  }

  if (req.query.search) {
    where.content = {
      [Op.substring]: req.query.search
    };
  }

  const notes = await Note.findAll({
    attributes: { exclude: ["userId"] },
    include: {
      model: User,
      attributes: ["name"],
    },
    where,
  });
  return res.status(200).json(notes);
});

notesRouter.post("/", tokenExtractor, async (req, res) => {
  try {
    const user = await User.findByPk(req.decodedToken.id);
    const note = await Note.create({
      ...req.body,
      userId: user.id,
      date: new Date(),
    });
    return res.status(201).json(note);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
});

notesRouter.get("/:id", noteFinder, async (req, res) => {
  if (req.note) {
    return res.status(200).json(req.note);
  } else {
    return res.status(404).end();
  }
});

notesRouter.delete("/:id", noteFinder, tokenExtractor, async (req, res) => {
  if (req.note) {
    await User.findByPk(req.decodedToken.id);

    await req.note.destroy();
  }
  return res.status(204).end();
});

notesRouter.put("/:id", noteFinder, tokenExtractor, async (req, res) => {
  if (req.note) {
    await User.findByPk(req.decodedToken.id);

    req.note.important = req.body.important;
    await req.note.save();
    return res.status(200).json(req.note);
  } else {
    return res.status(404).end();
  }
});

export default notesRouter;
