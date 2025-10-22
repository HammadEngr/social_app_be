import express from "express";
import { addUserDetails } from "../controllers/userController.js";
import uploadImages from "../middlewares/uploadImages.js";

const router = express.Router();

router.post("/:id/update", uploadImages, addUserDetails);

export default router;
