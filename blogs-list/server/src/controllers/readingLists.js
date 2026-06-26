import express from "express";

// Models
import { Blog, User, ReadingList } from "../models/index.js";

// Middleware
import tokenExtractor from "../middleware/tokenExtractor.js";
import validateReadingList from "../middleware/validators/validateReadingList.js";

const readingListRouter = express.Router();

// Add a blog to an user reading list
readingListRouter.post("/", tokenExtractor, validateReadingList, async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const blogId = req.body.blogId;

    const user = await User.findByPk(userId);
    const blog = await Blog.findByPk(blogId);

    // Confirm both the user and the blog exists
    if (!user || !blog) {
      return res.status(404).end();
    }

    // Confirm the logged in user is adding the blog to its own reading list
    if (userId !== req.decodedToken.id) {
      return res
        .status(401)
        .json({ error: "You cannot add a blog to another user reading list" });
    }

    // Add the blog to the reading list
    await ReadingList.create({
      userId,
      blogId,
    });

    return res.status(200).json(
      {
        message: `${blog.title} by ${blog.author} was added to the ${user.name}'s reading list`
      }
    );
  } catch (err) {
    next(err);
  }
});

export default readingListRouter;
