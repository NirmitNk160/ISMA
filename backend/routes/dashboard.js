import express from "express";
import db from "../db.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [[revenue]] = await db.query(
      `
      SELECT
        COALESCE(SUM(s.quantity * p.price), 0) AS totalRevenue,
        COALESCE(SUM(s.quantity), 0) AS itemsSold
      FROM sales s
      JOIN products p ON p.id = s.product_id
      WHERE s.user_id = ?
      `,
      [userId]
    );

    const [[products]] = await db.query(
      `
      SELECT COUNT(*) AS activeProducts
      FROM products
      WHERE user_id = ?
      `,
      [userId]
    );

    const [topProducts] = await db.query(
      `
      SELECT
        p.name,
        SUM(s.quantity) AS sold
      FROM sales s
      JOIN products p ON p.id = s.product_id
      WHERE s.user_id = ?
      GROUP BY s.product_id
      ORDER BY sold DESC
      LIMIT 5
      `,
      [userId]
    );

    res.json({
      totalRevenue: Number(revenue.totalRevenue),
      itemsSold: Number(revenue.itemsSold),
      activeProducts: Number(products.activeProducts),
      topProducts,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
});

export default router;
