// Model
import Blog from "../models/blog.js";

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

// Handles finding an object based on its id
export async function blogFinder(req, res, next) {
  req.blog = await Blog.findByPk(req.params.id);
  if (!req.blog) {
    return res.status(404).end();
  }
  next();
}
