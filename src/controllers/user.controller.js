import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import sendEmail from "../utils/mailer.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, password } = req.body;

  // Validate input data
  if (!username || !email || !fullname || !password) {
    throw new ApiError(400, "All Fields required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  if (!req.files || !req.files.avatar || !req.files.avatar[0]) {
    throw new ApiError(400, "Avatar File is Required");
  }

  const avatarLocalPath = req.files.avatar[0].path;

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  const user = await User.create({
    username,
    email,
    fullname,
    password,
    avatar: avatar.url,
    otp,
    isVerified: false,
  });

  await sendEmail(
    user.email,
    "Verify your account",
    `Your OTP for account verification is ${otp}`
  );

  const createdUser = await User.findById(user._id).select(
    "-password  -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  user.otp = otp;
  await user.save();

  await sendEmail(
    user.email,
    "Verify your account",
    `Your OTP for account verification is ${otp}`
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, "OTP sent successfully"));
});

const verifyUser = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  const user = await User.findOne({ otp: Number(otp) });
  console.log(user);
  if (!user) {
    throw new ApiError(400, "Invalid OTP or email");
  }

  user.isVerified = true;
  user.otp = null;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "User verified successfully"));
});

export { registerUser, sendOtp, verifyUser };
