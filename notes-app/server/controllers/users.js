// Dependencies
import express from "express";
import bcrypt from "bcrypt";

// Models
import { User, Note } from "../models/index.js";

const usersRouter = express.Router();

// Routes
usersRouter.get("/", async (req, res) => {
  const users = await User.findAll({
    attributes: {
      exclude: ["password"],
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
      password: passwordHash
    });

    // Remove sensitive field from the response
    const nonSensitiveData = newUser.toJSON();
    delete nonSensitiveData.password;

    return res.status(201).json(nonSensitiveData);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

usersRouter.get("/:id", async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: {
      exclude: ["password"]
    }
  });

  if (user) {
    res.json(user);
  } else {
    res.status(404).end();
  }
});

export default usersRouter;
