// Dependencies
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { SECRET } from "../utils/config.js";

// Model
import User from "../models/user.js";

const loginRouter = express.Router();

loginRouter.post("/", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      where: {
        username: username
      }
    });

    const passwordCorrect = user === null
      ? false
      : await bcrypt.compare(password, user.password);

    if (!(user && passwordCorrect)) {
      return res.status(401).json({
        error: "Invalid username or password"
      });
    }

    const userForToken = {
      username: user.username,
      id: user.id,
    };

    const token = jwt.sign(userForToken, SECRET);

    res.status(200).send({ token, username: user.username, name: user.name });
  } catch (err) {
    next(err);
  }
});

export default loginRouter;
