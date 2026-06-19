// Dependencies
import { body, validationResult } from "express-validator";

// Validations
const validateNote = [
  body("content").notEmpty().withMessage("Note's content is required"),

  // Handles the error response
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      return res.status(400).json({ error: errorMessages });
    }
    next();
  },
];

export default validateNote;
