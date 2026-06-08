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
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET a blog by its id
blogsRouter.get("/:id", blogFinder, async (req, res, next) => {
  try {
    return res.json(req.blog);
  } catch (error) {
    next(error);
  }
});

// POST a new blog
blogsRouter.post("/", async (req, res, next) => {
  try {
    const { title, author, url, likes } = req.body;

    const newBlog = await Blog.create({
      title,
      author,
      url,
      likes
    });

    res.status(201).json(newBlog);
  } catch (error) {
    next(error);
  }
});

// DELETE a blog
blogsRouter.delete("/:id", async (req, res, next) => {
  try {
    const blogId = req.params.id;
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
  } catch (error) {
    next(error);
  }
});

// PUT (update) a blog's number of likes
blogsRouter.put("/:id", blogFinder, async (req, res, next) => {
  try {
    const likes = req.body.likes;

    // Assert the number of likes is valid
    if (
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

    res.json(blogToUpdate.toJSON());
  } catch (error) {
    next(error);
  }
});

export default blogsRouter;
