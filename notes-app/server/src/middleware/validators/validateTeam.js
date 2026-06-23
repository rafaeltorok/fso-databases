// Dependencies
import { body, validationResult } from "express-validator";

// Validations
const validateTeam = [
  // Check if it is empty
  body("name").notEmpty().withMessage("Name is required"),

  // Check if the name is within the allowed length
  body("name")
    .isLength({ min: 3, max: 32 })
    .withMessage("Name must be between 3 and 32 chars long"),

  // Handles the error response
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      return res.status(400).json({ error: errorMessages });
    }
    next();
  }
];

export default validateTeam;
