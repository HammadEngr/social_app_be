import express from "express";
import {
  refreshAccessToken,
  signIn,
  signup,
  signOut,
  activateUser,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signin", signIn);
router.post("/signup", signup);
router.post("/signout", signOut);
router.post("/refresh", refreshAccessToken);
router.get("/activate/:token", activateUser);
router.post("/forgotPassword", forgotPassword);
router.get("/resetPassword/:token", resetPassword);

export default router;
