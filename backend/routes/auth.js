import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { register, login, profile, updateProfile } from "../controllers/authController.js";
import { verifyOTP } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.get("/profile", verifyToken, profile);
router.put("/profile", verifyToken, updateProfile);

export default router;