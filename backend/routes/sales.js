import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { getSales, downloadInvoice  } from "../controllers/salesController.js";

const router = express.Router();

router.get("/", verifyToken, getSales);
router.get("/invoice/:billId", verifyToken, downloadInvoice);

export default router;