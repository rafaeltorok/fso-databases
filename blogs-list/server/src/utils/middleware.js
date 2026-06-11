// Dependencies
import jwt from "jsonwebtoken";
import { SECRET } from "./config.js";

// Models
import { Blog, User } from "../models/index.js";

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error(err); // Log on the server for debugging

  if (err.name === "CastError") {
    return res.status(400).json({ error: "malformatted id" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  if (
    err.name === "MongoServerError" &&
    err.message.includes("E11000 duplicate key error")
  ) {
    return res.status(400).json({ error: "expected `username` to be unique" });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: "duplicate key" });
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
      exclude: ["password"]
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
