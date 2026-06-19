// Dependencies
import jwt from "jsonwebtoken";

// Variables
import { SECRET } from "./config.js";

// Models
import Note from "../models/note.js";
import User from "../models/user.js";

// Verify if a token is valid or not
export const tokenExtractor = (req, res, next) => {
  const authorization = req.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    try {
      console.log(authorization.substring(7));
      console.log(SECRET);
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET);
    } catch (error) {
      console.log(error);
      return res.status(401).json({ error: "token invalid" });
    }
  } else {
    return res.status(401).json({ error: "token missing" });
  }

  next();
};

// Find a note by its id
export const noteFinder = async (req, res, next) => {
  req.note = await Note.findByPk(req.params.id);
  next();
};

// Check if the currently logged user has admin permission
export const isAdmin = async (req, res, next) => {
  const user = await User.findByPk(req.decodedToken.id);

  if (!user.admin) {
    return res.status(401).json({ error: "Operation not allowed" });
  }

  next();
};
