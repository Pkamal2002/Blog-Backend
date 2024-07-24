import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import sendEmail from "../utils/mailer.js";

//Method To generate AccessToken And refresh Token

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

//////////////////////////////////////////////////
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, password, confirmPassword } = req.body;

  // Validate input data
  if (!username || !email || !fullname || !password || !confirmPassword) {
    throw new ApiError(400, "All Fields required");
  }
  if (password!== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
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
    "-password  -refreshToken -otp"
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

//Login Section Starts...

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email && !password) {
    throw new ApiError(400, "Please provide both email and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }
  const varifiedUser = user.isVerified;
  if (varifiedUser != true) {
    throw new ApiError(403, "Please verify your account");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -otp"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser, accessToken, refreshToken
      },
      "User logged in Successfully"
    )
  )
});

//LogOut section Starts...
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

export { registerUser, sendOtp, verifyUser, loginUser, logoutUser };
