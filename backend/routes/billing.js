import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { confirmBill } from "../controllers/billingController.js";

const router = express.Router();

router.post("/confirm", verifyToken, confirmBill);

export default router;