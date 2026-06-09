// Dependencies
import express from "express";
import User from "../models/user.js";
import bcrypt from "bcrypt";

// Middleware
import { userFinder } from "../utils/middleware.js";

const userRouter = express.Router();

// GET all
userRouter.get("/", async (req, res, next) => {
  try {
    const data = await User.findAll({
      attributes: {
        exclude: ["password"]
      }
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

    if (
      username === undefined ||
      name === undefined ||
      password === undefined
    ) {
      return res.status(400).send({ error: "Missing required fields" });
    }

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

    res.status(201).json(nonSensitiveData);
  } catch (err) {
    next(err);
  }
});

// DELETE an user
userRouter.delete("/:id", async (req, res, next) => {
  try {
    const userId = req.params.id;

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

export default userRouter;
