import express from "express";
import db from "../db.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

/* ADD PRODUCT */
router.post("/", verifyToken, (req, res) => {
  const { name, category, stock, price, description } = req.body;
  const userId = req.user.id;

  if (!name || !category || stock === "" || price === "") {
    return res.status(400).json({ message: "All fields required" });
  }

  const sql = `
    INSERT INTO products (user_id, name, category, stock, price, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [userId, name, category, Number(stock), Number(price), description],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "DB error" });
      }
      res.status(201).json({ message: "Product added" });
    }
  );
});

/* GET PRODUCTS */
router.get("/", verifyToken, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT id, name, category, stock, price,
    CASE
      WHEN stock = 0 THEN 'Out'
      WHEN stock < 15 THEN 'Low'
      ELSE 'In Stock'
    END AS status
    FROM products
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "DB error" });
    }
    res.json(rows);
  });
});

/* DELETE PRODUCT */
router.delete("/:id", verifyToken, (req, res) => {
  const userId = req.user.id;
  const productId = req.params.id;

  const sql = `
    DELETE FROM products
    WHERE id = ? AND user_id = ?
  `;

  db.query(sql, [productId, userId], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Deleted" });
  });
});

export default router;
