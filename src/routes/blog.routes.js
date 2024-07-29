import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { blogCount, deleteBlog, getAllBlogs, getAllLoginUsersBlogs, getSingleBlog, submitBlog, updateBlog } from "../controllers/blog.controller.js";




const router = Router();




router.route("/submitBlog").post(
    upload.fields([
      { name: "image", maxCount: 1 }
    ]),
    verifyJWT,
    submitBlog
    
  );

  router.route("/blogCount").post(verifyJWT ,blogCount);
  router.route("/getAllBlogs").get(getAllBlogs);
  router.route("/:blogId").get(getSingleBlog);


  router.route("/getAllLoginUsersBlogs").get(verifyJWT,getAllLoginUsersBlogs)
// Add the DELETE route here
router.route("/:blogId").delete(verifyJWT, deleteBlog);


// Add the PUT route here
router.route("/:blogId").put(verifyJWT, updateBlog);





export default router;