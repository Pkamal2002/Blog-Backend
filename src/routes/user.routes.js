import { Router } from "express";
import { registerUser, sendOtp, verifyUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validateRegisterInput } from "../helper/userValidator.js";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 }
  ]),
  validateRegisterInput,
  handleValidationErrors, // Add this middleware to handle validation results
  registerUser
);

router.route("/send-otp").post(sendOtp);
router.route("/verify").post(verifyUser);

export default router;
