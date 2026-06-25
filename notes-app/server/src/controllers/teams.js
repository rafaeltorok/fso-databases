// Dependencies
import express from "express";

// Models
import { Team } from "../models/index.js";
import { User } from "../models/index.js";

// Middleware
import validateId from "../middleware/validators/validateId.js";
import validateTeam from "../middleware/validators/validateTeam.js";
import { tokenExtractor } from "../middleware/tokenExtractor.js";
import { isAdmin } from "../middleware/isAdmin.js";

const teamsRouter = express.Router();

// Get all teams
teamsRouter.get("/", async (req, res, next) => {
  try {
    const teams = await Team.findAll({
      include: [
        {
          model: User,
          attributes: {
            exclude: ["passwordHash", "createdAt", "updatedAt"],
          },
          through: {
            attributes: [],
          },
        },
      ],
    });

    return res.status(200).json(teams);
  } catch (err) {
    next(err);
  }
});

// Get team by id
teamsRouter.get("/:id", validateId, async (req, res, next) => {
  try {
    const team = await Team.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: {
            exclude: ["passwordHash", "createdAt", "updatedAt"],
          },
          through: {
            attributes: [],
          },
        },
      ],
    });

    if (!team) {
      return res.status(404).end();
    }

    return res.status(200).json(team);
  } catch (err) {
    next(err);
  }
});

// Create a new team (admins only)
teamsRouter.post(
  "/",
  tokenExtractor,
  isAdmin,
  validateTeam,
  async (req, res, next) => {
    try {
      const newTeam = await Team.create({
        name: req.body.name,
      });

      return res.status(201).json(newTeam);
    } catch (err) {
      next(err);
    }
  },
);

// Add an user to a team (admins only)
teamsRouter.post(
  "/:id/users",
  tokenExtractor,
  isAdmin,
  validateId,
  async (req, res, next) => {
    try {
      const team = await Team.findByPk(req.params.id);

      // Check if the team exists
      if (!team) {
        return res.status(404).end();
      }

      if (
        !req.body.username ||
        req.body.username === "" ||
        typeof req.body.username !== "string"
      ) {
        return res.status(400).json({ error: "Invalid username" });
      }

      // Check if the user exists
      const user = await User.findOne({
        where: {
          username: req.body.username,
        },
      });

      if (!user) {
        return res.status(404).end();
      }

      // Add the user to the team
      await team.addUser(user);

      return res
        .status(201)
        .json({ message: `${user.name} was added to "${team.name}"` });
    } catch (err) {
      next(err);
    }
  },
);

// Delete a team (admins only)
teamsRouter.delete(
  "/:id",
  tokenExtractor,
  isAdmin,
  validateId,
  async (req, res, next) => {
    try {
      const removedTeams = await Team.destroy({
        where: {
          id: req.params.id,
        },
      });

      if (removedTeams === 1) {
        return res.status(204).end();
      } else {
        return res.status(404).end();
      }
    } catch (err) {
      next(err);
    }
  },
);

// Remove an user from a team (admins only)
teamsRouter.delete(
  "/:id/users/:user_id",
  tokenExtractor,
  isAdmin,
  validateId,
  async (req, res, next) => {
    try {
      const team = await Team.findByPk(req.params.id);

      // Check if the team exists
      if (!team) {
        return res.status(404).end();
      }

      const user = await User.findByPk(req.params.user_id);

      // Check if the user exists
      if (!user) {
        return res.status(404).end();
      }

      await team.removeUser(user);

      return res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
);

export default teamsRouter;
