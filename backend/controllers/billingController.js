import db from "../config/db.js";
import { sendInvoiceEmail } from "../services/emailService.js";

export const confirmBill = async (req, res) => {
  const userId = req.user.id;
  const { items, customerEmail, customerName, paymentMethod, currency } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "No items provided" });
  }

  const conn = await db.getConnection();
  const billId = `BILL-${Date.now()}`;

  try {
    await conn.beginTransaction();

    let totalAmount = 0;
    let soldItems = [];

    for (const item of items) {
      const qty = Number(item.quantity);

      if (!item.product_id || qty <= 0) {
        throw new Error("Invalid item data");
      }

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
      totalAmount += totalPrice;

      soldItems.push({
        name: product.name,
        quantity: qty,
        unitPrice,
        totalPrice,
      });

      /* UPDATE STOCK */
      await conn.query(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [qty, product.id]
      );

      /* SAVE SALE */
      await conn.query(
        `INSERT INTO sales
        (user_id, product_id, product_name, quantity, unit_price, total_price, status, bill_id)
        VALUES (?, ?, ?, ?, ?, ?, 'PAID', ?)`,
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

    /* ================= GET SHOP PROFILE ================= */

    const [profileRows] = await conn.query(
      `SELECT shop_name, mobile FROM users WHERE id = ?`,
      [userId]
    );

    const shop = profileRows[0] || {};

    /* ================= COMMIT BILL ================= */

    await conn.commit();

    /* ================= SEND EMAIL (AFTER COMMIT) ================= */

    if (customerEmail) {
      try {
        await sendInvoiceEmail({
          to: customerEmail,
          billId,
          items: soldItems,
          totalAmount,
          shopName: shop.shop_name,
          shopPhone: shop.mobile,
          customerName,
          paymentMethod,
          currency,
        });
      } catch (emailError) {
        console.error("Email failed:", emailError);
        // Do not break billing if email fails
      }
    }

    res.json({
      message: "Bill confirmed",
      bill_id: billId,
    });

  } catch (err) {
    await conn.rollback();
    res.status(400).json({ message: err.message });
  } finally {
    conn.release();
  }
};