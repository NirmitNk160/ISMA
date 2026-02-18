import express from "express";
import db from "../db.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

/* =========================================================
   ADD PRODUCT
========================================================= */
router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      size,
      stock,
      price,
      description,
      barcode,
      sku,
      image_url,
      min_stock = 5,
      expiry_date = null,
    } = req.body;

    const userId = req.user.id;

    if (!name || !category || stock === "" || price === "") {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (Number(stock) < 0 || Number(price) < 0) {
      return res.status(400).json({
        message: "Stock and price must be non-negative",
      });
    }

    await db.query(
      `
      INSERT INTO products
      (user_id, name, brand, category, size, stock, price,
       description, barcode, sku, image_url, min_stock, expiry_date, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)
      `,
      [
        userId,
        name,
        brand || null,
        category,
        size || null,
        Number(stock),
        Number(price),
        description || null,
        barcode || null,
        sku || null,
        image_url || null,
        Number(min_stock),
        expiry_date || null,
      ]
    );

    res.status(201).json({ message: "Product added" });
  } catch (err) {
    console.error("Add product error:", err);
    res.status(500).json({ message: "DB error" });
  }
});

/* =========================================================
   LOW STOCK ALERT
========================================================= */
router.get("/low-stock", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT id, name, stock, min_stock
      FROM products
      WHERE user_id = ?
        AND is_deleted = FALSE
        AND stock <= min_stock
      ORDER BY stock ASC
      `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Low stock error:", err);
    res.status(500).json({ message: "Failed to fetch low stock products" });
  }
});

/* =========================================================
   EXPIRY ALERTS (Next 7 days + expired)
========================================================= */
router.get("/expiry-alerts", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT id, name, expiry_date
      FROM products
      WHERE user_id = ?
        AND expiry_date IS NOT NULL
        AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        AND is_deleted = FALSE
      ORDER BY expiry_date ASC
      `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Expiry alert error:", err);
    res.status(500).json({ message: "Failed to fetch expiry alerts" });
  }
});

/* =========================================================
   BARCODE SEARCH
========================================================= */
router.get("/barcode/:code", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const code = req.params.code;

    const [rows] = await db.query(
      `
      SELECT id, name, brand, category, size, price, stock, barcode, image_url
      FROM products
      WHERE barcode=? AND user_id=? AND is_deleted=FALSE
      LIMIT 1
      `,
      [code, userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "DB error" });
  }
});

/* =========================================================
   ARCHIVED PRODUCTS
========================================================= */
router.get("/archived/all", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT id, name, brand, category, size, stock,
             price, description, barcode, image_url, sku
      FROM products
      WHERE user_id = ? AND is_deleted = TRUE
      ORDER BY created_at DESC
      `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
});

/* =========================================================
   GET ALL PRODUCTS
========================================================= */
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT
        p.id,
        p.name,
        p.brand,
        p.category,
        p.size,
        p.stock,
        p.price,
        p.description,
        p.barcode,
        p.image_url,
        p.sku,
        p.expiry_date,
        CASE
          WHEN p.stock = 0 THEN 'Out'
          WHEN p.stock < 15 THEN 'Low'
          ELSE 'In Stock'
        END AS status,
        EXISTS(
          SELECT 1 FROM sales s WHERE s.product_id = p.id
        ) AS hasSales
      FROM products p
      WHERE p.user_id = ? AND p.is_deleted = FALSE
      ORDER BY p.created_at DESC
      `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
});

/* =========================================================
   GET SINGLE PRODUCT
========================================================= */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;

    const [rows] = await db.query(
      `
      SELECT name, brand, category, size, stock, price,
             description, barcode, sku, image_url,
             min_stock, expiry_date
      FROM products
      WHERE id=? AND user_id=? AND is_deleted=FALSE
      `,
      [productId, userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(rows[0]);
  } catch {
    res.status(500).json({ message: "DB error" });
  }
});

/* =========================================================
   UPDATE PRODUCT
========================================================= */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      size,
      stock,
      price,
      description,
      barcode,
      sku,
      image_url,
      min_stock = 5,
      expiry_date = null,
    } = req.body;

    const userId = req.user.id;
    const productId = req.params.id;

    if (!name || !category || stock === "" || price === "") {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (Number(stock) < 0 || Number(price) < 0) {
      return res.status(400).json({
        message: "Stock and price must be non-negative",
      });
    }

    const [result] = await db.query(
      `
      UPDATE products SET
        name=?, brand=?, category=?, size=?,
        stock=?, price=?, description=?, barcode=?,
        sku=?, image_url=?, min_stock=?, expiry_date=?
      WHERE id=? AND user_id=? AND is_deleted=FALSE
      `,
      [
        name,
        brand || null,
        category,
        size || null,
        Number(stock),
        Number(price),
        description || null,
        barcode || null,
        sku || null,
        image_url || null,
        Number(min_stock),
        expiry_date || null,
        productId,
        userId,
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "DB error" });
  }
});

/* =========================================================
   SOFT DELETE
========================================================= */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;

    const [result] = await db.query(
      `UPDATE products SET is_deleted=TRUE WHERE id=? AND user_id=?`,
      [productId, userId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product archived successfully" });
  } catch {
    res.status(500).json({ message: "DB error" });
  }
});

/* =========================================================
   RESTORE PRODUCT
========================================================= */
router.put("/restore/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;

    const [result] = await db.query(
      `UPDATE products SET is_deleted=FALSE WHERE id=? AND user_id=?`,
      [productId, userId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product restored" });
  } catch {
    res.status(500).json({ message: "DB error" });
  }
});

/* =========================================================
   PERMANENT DELETE
========================================================= */
router.delete("/permanent/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;

    await db.query("DELETE FROM products WHERE id=? AND user_id=?", [
      productId,
      userId,
    ]);

    res.json({ message: "Product permanently deleted" });
  } catch {
    res.status(500).json({ message: "DB error" });
  }
});

export default router;
