import express from "express";
import {
  createPost,
  deletePost,
  editPost,
  getAllPosts,
} from "../controllers/postsController.js";

const router = express.Router();

router.get("/allposts/:userId", getAllPosts);

router.post("/newpost", createPost);
router.route("/post/:postId").delete(deletePost).patch(editPost);

export default router;
