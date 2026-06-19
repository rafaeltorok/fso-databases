// Dependencies
import express from "express";
import { Op } from "sequelize";

// Models
import { Note, User } from "../models/index.js";

// Middleware
import { tokenExtractor } from "../middleware/tokenExtractor.js";
import { noteFinder } from "../middleware/noteFinder.js";
import validateNote from "../middleware/validators/notesValidator.js";
import validateId from "../middleware/validators/validateId.js";

const notesRouter = express.Router();

// Routes

// GET all notes
notesRouter.get("/", async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
});

// GET a note by its id
notesRouter.get("/:id", validateId, noteFinder, async (req, res, next) => {
  try {
    return res.status(200).json(req.note);
  } catch (err) {
    next(err);
  }
});

// POST a new note
notesRouter.post("/", tokenExtractor, validateNote, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.decodedToken.id);
    const note = await Note.create({
      ...req.body,
      userId: user.id,
      date: new Date(),
    });
    return res.status(201).json(note);
  } catch (err) {
    next(err);
  }
});

// DELETE a note
notesRouter.delete("/:id", noteFinder, tokenExtractor, async (req, res, next) => {
  try {
    if (req.note) {
      await User.findByPk(req.decodedToken.id);

      await req.note.destroy();
    }
    return res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// PUt (update) the importance of a note
notesRouter.put("/:id", validateId, noteFinder, tokenExtractor, async (req, res, next) => {
  try {
    if (req.note) {
      await User.findByPk(req.decodedToken.id);

      req.note.important = req.body.important;
      await req.note.save();
      return res.status(200).json(req.note);
    } else {
      return res.status(404).end();
    }
  } catch (err) {
    next(err);
  }
});

export default notesRouter;
