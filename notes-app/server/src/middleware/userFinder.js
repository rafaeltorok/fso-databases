// Models
import { User, Note } from "../models/index.js";

// Handles finding a user based on its id
export async function userFinder(req, res, next) {
  req.user = await User.findByPk(req.params.id, {
    attributes: {
      exclude: ["passwordHash"],
    },
    include: {
      model: Note,
      attributes: {
        exclude: ["userId"],
      },
    },
  });
  if (!req.user) {
    return res.status(404).end();
  }
  next();
}
