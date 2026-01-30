import express from "express";
import db from "../db.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

/* ================= ADD PRODUCT ================= */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, category, stock, price, description } = req.body;
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
      INSERT INTO products (user_id, name, category, stock, price, description)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [userId, name, category, Number(stock), Number(price), description]
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
      SELECT id, name, category, stock, price,
        CASE
          WHEN stock = 0 THEN 'Out'
          WHEN stock < 15 THEN 'Low'
          ELSE 'In Stock'
        END AS status
      FROM products
      WHERE user_id = ?
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

/* ================= GET SINGLE PRODUCT ================= */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;

    const [rows] = await db.query(
      `
      SELECT name, category, stock, price, description
      FROM products
      WHERE id = ? AND user_id = ?
      `,
      [productId, userId]
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
    const { name, category, stock, price, description } = req.body;
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
      SET name = ?, category = ?, stock = ?, price = ?, description = ?
      WHERE id = ? AND user_id = ?
      `,
      [
        name,
        category,
        Number(stock),
        Number(price),
        description,
        productId,
        userId,
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ message: "DB error" });
  }
});

/* ================= DELETE PRODUCT ================= */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;

    // 🔒 Prevent deletion if product has sales
    const [sales] = await db.query(
      "SELECT id FROM sales WHERE product_id = ? LIMIT 1",
      [productId]
    );

    if (sales.length) {
      return res.status(400).json({
        message: "Cannot delete product with existing sales",
      });
    }

    const [result] = await db.query(
      "DELETE FROM products WHERE id = ? AND user_id = ?",
      [productId, userId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "DB error" });
  }
});

export default router;
