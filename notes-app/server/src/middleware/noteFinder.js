// Models
import Note from "../models/note.js";
import User from "../models/user.js";

// Find a note by its id
export const noteFinder = async (req, res, next) => {
  req.note = await Note.findByPk(req.params.id, {
    attributes: {
      exclude: ["userId"],
    },
    include: {
      model: User,
      attributes: ["name"],
    },
  });
  if (!req.note) {
    return res.status(404).end();
  }
  next();
};
