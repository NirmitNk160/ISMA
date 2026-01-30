import express from "express";
import db from "../db.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

/*
  POST /api/billing/confirm
  Body:
  {
    items: [
      { product_id, quantity }
    ]
  }
*/
router.post("/confirm", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "No billing items provided" });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    for (const item of items) {
      // 1. Fetch product
      const [products] = await connection.query(
        "SELECT id, name, stock, price FROM products WHERE id = ? AND user_id = ? FOR UPDATE",
        [item.product_id, userId]
      );

      if (products.length === 0) {
        throw new Error("Product not found");
      }

      const product = products[0];

      // 2. Validate stock
      if (item.quantity > product.stock) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const totalPrice = item.quantity * product.price;

      // 3. Deduct inventory
      await connection.query(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [item.quantity, product.id]
      );

      // 4. Insert into sales
      await connection.query(
        `INSERT INTO sales 
          (user_id, product_id, product_name, quantity, unit_price, total_price, status)
         VALUES (?, ?, ?, ?, ?, ?, 'PAID')`,
        [
          userId,
          product.id,
          product.name,
          item.quantity,
          product.price,
          totalPrice,
        ]
      );
    }

    await connection.commit();
    res.json({ message: "Bill confirmed successfully" });

  } catch (err) {
    await connection.rollback();
    res.status(400).json({ message: err.message });
  } finally {
    connection.release();
  }
});

export default router;
