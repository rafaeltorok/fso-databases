// Dependencies
import express from "express";
import User from "../models/user.js";

// Middleware
import { userFinder } from "../utils/middleware.js";

const userRouter = express.Router();

// GET all
userRouter.get("/", async (req, res, next) => {
  try {
    const data = await User.findAll();
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
    const { username, name } = req.body;

    const newUser = await User.create({
      username,
      name
    });

    res.status(201).json(newUser);
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
