import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { blogCount, getAllBlogs, getAllLoginUsersBlogs, submitBlog } from "../controllers/blog.controller.js";




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
  router.route("/getAllLoginUsersBlogs").get(verifyJWT,getAllLoginUsersBlogs)






export default router;