import express from "express";
import {
  refreshAccessToken,
  signIn,
  signup,
  signOut,
  activateUser,
  forgotPassword,
  resetPassword,
  checkResetTokenValidity,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signin", signIn);
router.post("/signup", signup);
router.post("/signout", signOut);
router.post("/refresh", refreshAccessToken);
router.get("/activate/:token", activateUser);
router.post("/forgotPassword", forgotPassword);
router
  .route("/resetPassword/:token")
  .get(checkResetTokenValidity)
  .post(resetPassword);

export default router;
