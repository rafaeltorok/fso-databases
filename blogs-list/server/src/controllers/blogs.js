// Dependencies
import express from "express";
import Blog from "../models/blog.js";

// Middleware
import { blogFinder } from "../utils/middleware.js";

const blogsRouter = express.Router();

// GET all
blogsRouter.get("/", async (req, res, next) => {
  try {
    const data = await Blog.findAll();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
});

// GET a blog by its id
blogsRouter.get("/:id", blogFinder, async (req, res, next) => {
  try {
    return res.status(200).json(req.blog);
  } catch (err) {
    next(err);
  }
});

// POST a new blog
blogsRouter.post("/", async (req, res, next) => {
  try {
    const { title, author, url, likes } = req.body;

    // Check if any required fields are missing
    if (
      title === undefined ||
      author === undefined ||
      url === undefined
    ) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    // Assert the number of likes is valid if present
    if (likes !== undefined) {
      if (
        typeof likes !== "number" ||
        !Number.isFinite(likes) ||
        likes < 0
      ) {
        return res.status(400).json({ error: "Invalid number of likes" });
      }
    }

    // Create a new blog
    const newBlog = await Blog.create({
      title,
      author,
      url,
      likes
    });

    res.status(201).json(newBlog);
  } catch (err) {
    next(err);
  }
});

// DELETE a blog
blogsRouter.delete("/:id", async (req, res, next) => {
  try {
    const blogId = req.params.id;

    // Check if the ID passed has a valid numeric format
    if (
      !Number.isFinite(Number(blogId)) ||
      Number(blogId) < 0
    ) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Remove the blog
    const removedBlogs = await Blog.destroy({
      where: {
        id: blogId
      }
    });

    if (removedBlogs === 1) {
      res.status(204).end();
    } else {
      res.status(404).end();
    }
  } catch (err) {
    next(err);
  }
});

// PUT (update) a blog's number of likes
blogsRouter.put("/:id", blogFinder, async (req, res, next) => {
  try {
    const likes = req.body.likes;

    // Assert the number of likes is valid
    if (
      likes === undefined ||
      typeof likes !== "number" ||
      !Number.isFinite(likes) ||
      likes < 0
    ) {
      return res.status(400).json({ error: "Invalid number of likes" });
    }

    // Find the blog to be updated
    const blogToUpdate = req.blog;

    // Update the likes counter
    await blogToUpdate.update({ likes: likes });

    res.status(200).json(blogToUpdate.toJSON());
  } catch (err) {
    next(err);
  }
});

export default blogsRouter;
