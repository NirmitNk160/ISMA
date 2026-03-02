import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  addSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplierController.js";

const router = express.Router();

router.post("/", verifyToken, addSupplier);
router.get("/", verifyToken, getSuppliers);
router.get("/:id", verifyToken, getSupplierById);
router.put("/:id", verifyToken, updateSupplier);
router.delete("/:id", verifyToken, deleteSupplier);

export default router;