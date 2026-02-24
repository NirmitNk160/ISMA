import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { register, login, profile } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", verifyToken, profile);

export default router;