import { Router } from "express";
import { changeCurrentPassword, loginUser, logoutUser, registerUser, sendOtp,  updateAccountDetails,  updateAvatar,  verifyUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validateRegisterInput } from "../helper/userValidator.js";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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

router.route("/login").post(loginUser)

///secured routes....

router.route("/logout").post(verifyJWT, logoutUser)
router.route("/changePassword").patch(verifyJWT, changeCurrentPassword);
router.route("/updateAccountDetails").patch(verifyJWT, updateAccountDetails);
router.route("/updateAvatar").put(
  verifyJWT,
  upload.fields([
    { name: "avatar", maxCount: 1 }
  ]),
  updateAvatar
);




export default router;
