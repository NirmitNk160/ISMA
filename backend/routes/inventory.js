import express from "express";
import db from "../db.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

/* ================= ADD PRODUCT ================= */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, category, stock, price, description, barcode } = req.body;
    const userId = req.user.id;

    if (!name || !category || stock === "" || price === "") {
      return res.status(400).json({ message: "All fields required" });
    }

    if (Number(stock) < 0 || Number(price) < 0) {
      return res.status(400).json({
        message: "Stock and price must be non-negative",
      });
    }

    await db.query(
      `
      INSERT INTO products
      (user_id, name, category, stock, price, description, barcode, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)
      `,
      [userId, name, category, Number(stock), Number(price), description, barcode],
    );

    res.status(201).json({ message: "Product added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
});

/* ================= GET PRODUCTS ================= */
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT
        p.id, p.name, p.category, p.stock, p.price, p.description, p.barcode,
        CASE
          WHEN p.stock = 0 THEN 'Out'
          WHEN p.stock < 15 THEN 'Low'
          ELSE 'In Stock'
        END AS status,
        EXISTS(
          SELECT 1 FROM sales s 
          WHERE s.product_id = p.id
        ) AS hasSales
      FROM products p
      WHERE p.user_id = ? AND p.is_deleted = FALSE
      ORDER BY p.created_at DESC
      `,
      [userId],
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
});

/* ================= GET SINGLE PRODUCT ================= */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;

    const [rows] = await db.query(
      `
      SELECT name, category, stock, price, description, barcode
      FROM products
      WHERE id = ? AND user_id = ? AND is_deleted = FALSE
      `,
      [productId, userId],
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "DB error" });
  }
});

/* ================= UPDATE PRODUCT ================= */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { name, category, stock, price, description, barcode } = req.body;
    const userId = req.user.id;
    const productId = req.params.id;

    if (!name || !category || stock === "" || price === "") {
      return res.status(400).json({ message: "All fields required" });
    }

    if (Number(stock) < 0 || Number(price) < 0) {
      return res.status(400).json({
        message: "Stock and price must be non-negative",
      });
    }

    const [result] = await db.query(
      `
      UPDATE products
      SET name = ?, category = ?, stock = ?, price = ?, description = ?, barcode = ?
      WHERE id = ? AND user_id = ? AND is_deleted = FALSE
      `,
      [
        name,
        category,
        Number(stock),
        Number(price),
        description,
        barcode,
        productId,
        userId,
      ],
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ message: "DB error" });
  }
});

/* ================= SOFT DELETE PRODUCT ================= */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;

    const [result] = await db.query(
      `
      UPDATE products
      SET is_deleted = TRUE
      WHERE id = ? AND user_id = ?
      `,
      [productId, userId],
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product archived successfully" });
  } catch (err) {
    res.status(500).json({ message: "DB error" });
  }
});

/* ================= GET ARCHIVED PRODUCTS ================= */
router.get("/archived/all", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT id, name, category, stock, price, barcode, created_at
      FROM products
      WHERE user_id = ? AND is_deleted = TRUE
      ORDER BY created_at DESC
      `,
      [userId],
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "DB error" });
  }
});

/* ================= RESTORE PRODUCT ================= */
router.put("/restore/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;

    const [result] = await db.query(
      `
      UPDATE products
      SET is_deleted = FALSE
      WHERE id = ? AND user_id = ?
      `,
      [productId, userId],
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product restored" });
  } catch (err) {
    res.status(500).json({ message: "DB error" });
  }
});

/* ================= PERMANENT DELETE ================= */
router.delete("/permanent/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;

    await db.query("DELETE FROM products WHERE id=? AND user_id=?", [
      productId,
      userId,
    ]);

    res.json({ message: "Product permanently deleted" });
  } catch (err) {
    res.status(500).json({ message: "DB error" });
  }
});

/* ================= FIND PRODUCT BY BARCODE ================= */
router.get("/barcode/:code", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const code = req.params.code;

    const [rows] = await db.query(
      `
      SELECT id, name, price, stock, barcode
      FROM products
      WHERE barcode = ? AND user_id = ? AND is_deleted = FALSE
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


export default router;
