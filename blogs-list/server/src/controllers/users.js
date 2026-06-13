// Dependencies
import express from "express";
import bcrypt from "bcrypt";

// Models
import { Blog, User } from "../models/index.js";

// Middleware
import { userFinder } from "../middleware/finders.js";

const userRouter = express.Router();

// GET all
userRouter.get("/", async (req, res, next) => {
  try {
    const data = await User.findAll({
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
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
});

// GET by id
userRouter.get("/:id", userFinder, async (req, res, next) => {
  try {
    return res.status(200).json(req.user);
  } catch (err) {
    next(err);
  }
});

// POST a new user
userRouter.post("/", async (req, res, next) => {
  try {
    const { username, name, password } = req.body;

    // Check if the password is present
    if (password === undefined) {
      return res.status(400).json({ error: "Password is required" });
    }

    // Assert the length of the password
    const minLength = 5;
    const maxLength = 64;
    if (password.length < minLength || password.length > maxLength) {
      return res.status(400).json(
        { error: `Password length must be between ${minLength} and ${maxLength} chars` }
      );
    }

    // Hash the password to be stored
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create the new user
    const newUser = await User.create({
      username,
      name,
      passwordHash: passwordHash
    });

    // Remove sensitive field from the response
    const nonSensitiveData = newUser.toJSON();
    delete nonSensitiveData.passwordHash;

    res.status(201).json(nonSensitiveData);
  } catch (err) {
    next(err);
  }
});

// DELETE an user
userRouter.delete("/:id", async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Check if the ID passed has a valid numeric format
    if (
      !Number.isFinite(Number(userId)) ||
      Number(userId) < 0
    ) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Remove the user
    const removedUsers = await User.destroy({
      where: {
        id: userId
      }
    });

    if (removedUsers === 1) {
      return res.status(204).end();
    } else {
      return res.status(404).end();
    }
  } catch (err) {
    next(err);
  }
});

// PUT (update) a user's name
userRouter.put("/:username", async (req, res, next) => {
  try {
    const newName = req.body.name;
    const userToUpdate = await User.findOne({
      where: {
        username: req.params.username
      },
    });

    // Check if the user exists
    if (!userToUpdate) {
      return res.status(404).end();
    }

    // Check if the new name is invalid
    if (
      newName === undefined ||
      newName.trim() === ""
    ) {
      return res.status(400).json({ error: "Invalid user's name" });
    }

    // Update and return the user's info
    await userToUpdate.update({ name: newName });

    // Remove sensitive field from the response
    const nonSensitiveData = userToUpdate.toJSON();
    delete nonSensitiveData.passwordHash;

    return res.status(200).json(nonSensitiveData);
  } catch (err) {
    next(err);
  }
});

export default userRouter;
