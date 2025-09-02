import express from "express";
import {
  getUser,
  deleteUser,
  getAllUsers,
} from "../controllers/usersController.js";

const router = express.Router();

router.route("/:id").get(getUser).delete(deleteUser);

router.get("/all", getAllUsers);

export default router;
