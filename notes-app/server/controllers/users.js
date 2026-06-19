// Dependencies
import express from "express";
import bcrypt from "bcrypt";

// Models
import { User, Note } from "../models/index.js";

// Middleware
import { tokenExtractor, isAdmin } from "../util/middleware.js";

const usersRouter = express.Router();

// Routes
// Get all users
usersRouter.get("/", async (req, res) => {
  const users = await User.findAll({
    attributes: {
      exclude: ["passwordHash"],
    },
    include: {
      model: Note,
      attributes: {
        exclude: ["userId"]
      },
    },
  });
  res.json(users);
});

// Create a new user
usersRouter.post("/", async (req, res) => {
  try {
    const { username, name, password } = req.body;

    if (
      username === undefined ||
      name === undefined ||
      password === undefined
    ) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    // Check if the username is already taken
    const existingUser = await User.findOne({
      where: {
        username: username
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: "Username must be unique" });
    }

    // Hash the password to be stored
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      username,
      name,
      passwordHash
    });

    // Remove sensitive field from the response
    const nonSensitiveData = newUser.toJSON();
    delete nonSensitiveData.passwordHash;

    return res.status(201).json(nonSensitiveData);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

// Get an user based on its id
usersRouter.get("/:id", async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: {
      exclude: ["passwordHash"]
    }
  });

  if (user) {
    res.json(user);
  } else {
    res.status(404).end();
  }
});

// Admin-only route to enable or disable an user
usersRouter.put("/:username", tokenExtractor, isAdmin, async (req, res) => {
  const user = await User.findOne({
    where: {
      username: req.params.username
    }
  });

  if (user) {
    user.disabled = req.body.disabled;
    await user.save();
    return res.status(200).json(user);
  } else {
    return res.status(404).end();
  }
});

export default usersRouter;
