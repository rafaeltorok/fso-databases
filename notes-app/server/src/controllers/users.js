// Dependencies
import express from "express";
import bcrypt from "bcrypt";

// Models
import { User, Note } from "../models/index.js";

// Middleware
import { tokenExtractor } from "../middleware/tokenExtractor.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { userFinder } from "../middleware/userFinder.js";
import validateUser from "../middleware/validators/usersValidator.js";
import validateId from "../middleware/validators/validateId.js";
import validatePassword from "../middleware/validators/validatePassword.js";

const usersRouter = express.Router();

// Get all users
usersRouter.get("/", async (req, res, next) => {
  try {
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
    return res.status(200).json(users);
  } catch (err) {
    next(err);
  }
});

// Get an user based on its id
usersRouter.get("/:id", validateId, userFinder, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: {
        exclude: ["passwordHash"]
      },
      include: {
        model: Note,
        attributes: {
          exclude: ["userId"]
        },
      },
    });

    if (user) {
      res.json(user);
    } else {
      res.status(404).end();
    }
  } catch (err) {
    next(err);
  }
});

// Create a new user
usersRouter.post("/", validateUser, validatePassword, async (req, res, next) => {
  try {
    const { username, name, password } = req.body;

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
  } catch (err) {
    next(err);
  }
});

// DELETE an user
usersRouter.delete("/:id", validateId, async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Remove the user
    const removedUsers = await User.destroy({
      where: {
        id: userId,
      },
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

// Admin-only route to enable or disable an user
usersRouter.put("/:username", tokenExtractor, isAdmin, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        username: req.params.username
      }
    });

    // Check if the disabled value is a valid boolean
    if (typeof req.body.disabled !== "boolean") {
      return res.status(400).json({ error: "The disabled field must be either true or false" });
    }

    // Check if the user exists
    if (user) {
      user.disabled = req.body.disabled;
      await user.save();

      // Remove sensitive field from the response
      const nonSensitiveData = user.toJSON();
      delete nonSensitiveData.passwordHash;

      return res.status(200).send(nonSensitiveData);
    } else {
      return res.status(404).end();
    }
  } catch (err) {
    next(err);
  }
});

export default usersRouter;
