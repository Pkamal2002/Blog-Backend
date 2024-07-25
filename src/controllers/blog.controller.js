import { Blog } from "../models/blog.model.js";
import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const submitBlog = asyncHandler(async (req, res) => {
  const { title, content} = req.body;

//   Valodate input data..

  if (!title || !content ) {
    throw new ApiError(400, "All fields are required");
  }

  if (!req.files || !req.files.image || !req.files.image[0]) {
    throw new ApiError(400, "Image is required");
  }

  const imageLocalPath = req.files.image[0].path;

  const image = await uploadOnCloudinary(imageLocalPath);
  if (!image) {
    throw new ApiError(400, "Failed to upload image to cloudinary");
  }

  const blog = await Blog.create({
    title,
    content,
    image: image.url,
    userId: req.user._id,
    writter: req.user.fullname,
    writterAvatar: req.user.avatar
  });

  const createdBlog = await Blog.findById(blog._id);
  if (!createdBlog) {
    throw new ApiError(500, "Something went wrong while submitting the blog");
  }

  return res
    .status(200)
    .json(new ApiResponse("Blog created successfully", 200, createdBlog));
});

// Blog count section starts...

const blogCount = asyncHandler(async (req, res) => {
  try {
    const username = req.params.userId;

    const user = await User.findOne({ username }).exec();

    // console.log(req)

    // MongoDB aggregation query to count form submissions by user
    const count = await Blog.aggregate([
      { $match: { user: user._id } },
      { $count: "total" },
    ]);

    // console.log(count)

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { count: count.length > 0 ? count[0].total : 0 },
          "Blogs count fetched successfully"
        )
      );
  } catch (error) {
    // console.error(error);
    throw new ApiError(500, "Blogs Counting Failed..");
  }
});

// Blog count section ends...

// Get all Blogs....

const getAllBlogs = asyncHandler(async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 }).exec();

    return res
     .status(200)
     .json(new ApiResponse(200, blogs, "All Blogs fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to fetch all blogs");
  }
});


// get all blog of Login User....

const getAllLoginUsersBlogs = asyncHandler(async (req, res) => {
  try {
    const blogs = await Blog.find({ user: req.user.id }).sort({ createdAt: -1 }).exec();

    return res
     .status(200)
     .json(new ApiResponse(200, blogs, "All Blogs fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to fetch all blogs");
  }
});

// Get Single Blog....

const getSingleBlog = asyncHandler(async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId).exec();

    if (!blog) {
      throw new ApiError(404, "Blog not found");
    }

    return res
     .status(200)
     .json(new ApiResponse(200, blog, "Blog fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to fetch blog");
  }
});

export { submitBlog, blogCount, getAllBlogs, getAllLoginUsersBlogs, getSingleBlog };
