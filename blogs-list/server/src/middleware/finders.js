// Models
import { Blog, User } from "../models/index.js";

// Handles finding a blog based on its id
export async function blogFinder(req, res, next) {
  req.blog = await Blog.findByPk(req.params.id, {
    attributes: {
      exclude: ["userId"],
    },
    include: {
      model: User,
      attributes: ["name"],
    },
  });
  if (!req.blog) {
    return res.status(404).end();
  }
  next();
}

// Handles finding an user based on its id
export async function userFinder(req, res, next) {
  req.user = await User.findByPk(req.params.id, {
    attributes: {
      exclude: ["passwordHash"],
    },
    include: [
      {
        model: Blog,
        attributes: {
          exclude: ["userId"],
        },
      },
      {
        model: Blog,
        as: "readings",
        attributes: ["id", "title", "author", "url", "likes", "year"],
        through: {
          attributes: ["read", "addedOn"],
        },
      },
    ],
  });
  if (!req.user) {
    return res.status(404).end();
  }
  next();
}
