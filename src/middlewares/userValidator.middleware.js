
import { check } from "express-validator";

const validateRegisterInput = [
  check("fullname", "Fullname is required").notEmpty(),
  check("fullname", "Fullname must be between 2 and 50 characters long").isLength({ min: 2, max: 50 }),
  check("username", "Username is required").notEmpty(),
  check("username", "Username must be between 6 and 30 characters long").isLength({ min: 6, max: 30 }),
  check("email", "Email is required").notEmpty(),
  check("email", "Email is invalid").isEmail(),
  check("password", "Password is required").notEmpty(),
  check("password", "Password must be between 8 and 30 characters long").isLength({ min: 8, max: 30 }),
  check("password", "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/),
];
export{
    validateRegisterInput
}
