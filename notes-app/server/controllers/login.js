// Dependencies
import express from "express";

// Token and passwords
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// ENV variables
import { SECRET } from "../util/config.js";

// Models
import User from "../models/user.js";

const loginRouter = express.Router();

// Routes
loginRouter.post("/", async (req, res) => {
  const { username, password } = req.body;

  // Return an error message when missing credentials
  if (
    username === undefined ||
    password === undefined
  ) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  // Confirm the user exists on the database
  const user = await User.findOne({
    where: {
      username: username,
    },
  });

  // Check if the account has been disabled
  if (user.disabled) {
    return res.status(401).json({
      error: "Account has been disabled, please contact an admin"
    });
  }

  // If the user exists, check the hashed password
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash);

  // Return an error status if the user is not found
  // or the password is incorrect
  if (!(user && passwordCorrect)) {
    return res.status(401).json({
      error: "invalid username or password",
    });
  }

  // Generate access token
  const userForToken = {
    username: user.username,
    id: user.id,
  };

  const token = jwt.sign(userForToken, SECRET);

  // Return the token with the non-sensitive user info
  return res
    .status(200)
    .send({ token, username: user.username, name: user.name });
});

export default loginRouter;
