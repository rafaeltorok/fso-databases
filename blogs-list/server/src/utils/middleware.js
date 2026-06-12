// Dependencies
import jwt from "jsonwebtoken";
import { SECRET } from "./config.js";

// Models
import { Blog, User } from "../models/index.js";

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error(err); // Log on the server for debugging

  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({ error: "Username must be unique" });
  }

  if (err.name === "SequelizeValidationError") {
    if (err.errors.length > 1) {
      return res.status(400).json({ error: err.errors.map(error => error.message) });
    } else {
      return res.status(400).json({ error: err.errors[0].message });
    }
  }

  res.status(500).json({ error: "internal server error" });
}

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
      exclude: ["passwordHash"]
    },
    include: {
      model: Blog,
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

// Handles the authorization token
export async function tokenExtractor(req, res, next) {
  const authorization = req.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET);
    } catch {
      return res.status(401).json({ error: "invalid token" });
    }
  } else {
    return res.status(401).json({ error: "token missing" });
  }
  next();
}
