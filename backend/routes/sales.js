import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { getSales } from "../controllers/salesController.js";

const router = express.Router();

router.get("/", verifyToken, getSales);

export default router;