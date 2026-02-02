import express from "express";
import db from "../db.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/confirm", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "No items provided" });
  }

  const conn = await db.getConnection();
  const billId = `BILL-${Date.now()}`;

  try {
    await conn.beginTransaction();

    for (const item of items) {
      const qty = Number(item.quantity);

      if (!item.product_id || qty <= 0) {
        throw new Error("Invalid item data");
      }

      // 🔒 LOCK PRODUCT
      const [rows] = await conn.query(
        `SELECT id, name, price, stock
         FROM products
         WHERE id = ? AND user_id = ?
         FOR UPDATE`,
        [item.product_id, userId]
      );

      if (!rows.length) {
        throw new Error("Product not found");
      }

      const product = rows[0];

      if (product.stock < qty) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const unitPrice = Number(product.price);
      const totalPrice = unitPrice * qty;

      // ✅ UPDATE STOCK
      await conn.query(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [qty, product.id]
      );

      // ✅ INSERT SALE (THIS WAS BROKEN BEFORE)
      await conn.query(
        `
        INSERT INTO sales
        (user_id, product_id, product_name, quantity, unit_price, total_price, status, bill_id)
        VALUES (?, ?, ?, ?, ?, ?, 'PAID', ?)
        `,
        [
          userId,
          product.id,
          product.name,
          qty,
          unitPrice,
          totalPrice,
          billId,
        ]
      );
    }

    await conn.commit();
    res.json({ message: "Bill confirmed", bill_id: billId });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ message: err.message });
  } finally {
    conn.release();
  }
});

export default router;