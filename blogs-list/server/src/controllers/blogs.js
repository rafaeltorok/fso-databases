import express from "express";
import Blog from "../models/blog.js";

const blogsRouter = express.Router();

blogsRouter.get("/", async (req, res, next) => {
  try {
    const data = await Blog.findAll();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

blogsRouter.get("/:id", async (req, res, next) => {
  try {
    const data = await Blog.findById(req.params.id);

    if (data) {
      res.json(data);
    } else {
      res.status(404).end();
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.put("/:id", async (req, res, next) => {
  try {
    const likes = req.body.likes;

    if (likes === undefined || likes < 0) {
      return res.status(400).json({ error: "Invalid number of likes" });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { likes },
      { new: true, runValidators: true },
    );

    if (!updatedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json(updatedBlog);
  } catch (error) {
    next(error);
  }
});

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

blogsRouter.delete("/:id", async (req, res, next) => {
  try {
    const blogId = req.params.id;
    const blogToRemove = await Blog.findById(blogId);

    if (blogToRemove) {
      await Blog.findByIdAndDelete(blogId);
      res.status(204).end();
    } else {
      res.status(404).end();
    }
  } catch (error) {
    next(error);
  }
});

export default blogsRouter;
