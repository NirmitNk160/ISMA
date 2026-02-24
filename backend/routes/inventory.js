import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  addProduct,
  lowStock,
  expiryAlerts,
  barcodeSearch,
  getAllProducts,
  archiveProduct,
  getSingleProduct,
  updateProduct,
  archivedProducts,
  restoreProduct,
} from "../controllers/inventoryController.js";

const router = express.Router();

/* SPECIFIC ROUTES FIRST */
router.get("/low-stock", verifyToken, lowStock);
router.get("/expiry-alerts", verifyToken, expiryAlerts);
router.get("/barcode/:code", verifyToken, barcodeSearch);
router.get("/archived/all", verifyToken, archivedProducts);
router.put("/restore/:id", verifyToken, restoreProduct);

/* GENERAL ROUTES LAST */
router.post("/", verifyToken, addProduct);
router.get("/", verifyToken, getAllProducts);
router.get("/:id", verifyToken, getSingleProduct);
router.put("/:id", verifyToken, updateProduct);
router.delete("/:id", verifyToken, archiveProduct);

export default router;