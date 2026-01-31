import express from "express";
import db from "../db.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    /* ================= SALES SNAPSHOT (IMMUTABLE) ================= */
    const [[sales]] = await db.query(
      `
      SELECT
        COALESCE(SUM(total_price), 0) AS totalRevenue,
        COALESCE(SUM(quantity), 0) AS itemsSold
      FROM sales
      WHERE user_id = ?
      `,
      [userId]
    );

    /* ================= PRODUCTS ================= */
    const [[products]] = await db.query(
      `
      SELECT COUNT(*) AS activeProducts
      FROM products
      WHERE user_id = ?
      `,
      [userId]
    );

    /* ================= TOP PRODUCTS ================= */
    const [topProducts] = await db.query(
      `
      SELECT
        product_name AS name,
        SUM(quantity) AS sold
      FROM sales
      WHERE user_id = ?
      GROUP BY product_id, product_name
      ORDER BY sold DESC
      LIMIT 5
      `,
      [userId]
    );

    res.json({
      totalRevenue: Number(sales.totalRevenue),
      itemsSold: Number(sales.itemsSold),
      activeProducts: Number(products.activeProducts),
      topProducts,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
});

export default router;
