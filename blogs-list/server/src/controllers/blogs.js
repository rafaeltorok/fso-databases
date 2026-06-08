// Dependencies
import express from "express";
import Blog from "../models/blog.js";

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
blogsRouter.get("/:id", async (req, res, next) => {
  try {
    // GT the ID from the request
    const blogId = req.params.id;

    // Check if the ID is present on the request
    if (blogId === undefined) {
      return res.status(400).send("Missing Blog ID");
    }

    // Find the blog
    const data = await Blog.findOne({
      where: {
        id: blogId
      }
    });

    if (data) {
      res.json(data);
    } else {
      res.status(404).end();
    }
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
      likes: likes || 0,
      date: new Date()
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
blogsRouter.put("/:id", async (req, res, next) => {
  try {
    const likes = req.body.likes;
    const blogId = req.params.id;

    // Assert the number of likes is valid
    if (
      typeof likes !== "number" ||
      !Number.isFinite(likes) ||
      likes < 0
    ) {
      return res.status(400).json({ error: "Invalid number of likes" });
    }

    // Find the blog to be updated
    const blogToUpdate = await Blog.findOne({
      where: {
        id: blogId
      }
    });

    // Blog not found: return an error response
    if (!blogToUpdate) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Update the likes counter
    await blogToUpdate.update({ likes: likes });

    res.json(blogToUpdate.toJSON());
  } catch (error) {
    next(error);
  }
});

export default blogsRouter;
