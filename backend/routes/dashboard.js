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
      [userId],
    );

    /* ================= PRODUCTS ================= */
    const [[products]] = await db.query(
      `
      SELECT COUNT(*) AS activeProducts
      FROM products
      WHERE user_id = ?
      `,
      [userId],
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
      [userId],
    );

    /* ================= IMPROVED SALES TREND ================= */
    const [salesTrend] = await db.query(
      `
  SELECT
    DATE(s.created_at) AS date,
    SUM(s.total_price) AS revenue,
    COUNT(DISTINCT s.bill_id) AS orders,
    SUM(s.total_price - (COALESCE(p.cost_price,0) * s.quantity)) AS profit,
    SUM(COALESCE(p.cost_price,0) * s.quantity) AS expenses
  FROM sales s
  JOIN products p ON p.id = s.product_id
  WHERE s.user_id = ?
  AND s.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  GROUP BY DATE(s.created_at)
  ORDER BY date ASC

  `,
      [userId],
    );

    /* ================= EXPENSE + PROFIT ================= */
    const [[finance]] = await db.query(
      `
  SELECT
    COALESCE(SUM(p.cost_price * s.quantity), 0) AS totalExpenses,
    COALESCE(SUM(s.total_price), 0) -
    COALESCE(SUM(p.cost_price * s.quantity), 0) AS totalProfit
  FROM sales s
  JOIN products p ON p.id = s.product_id
  WHERE s.user_id = ?
  `,
      [userId],
    );

    res.json({
      totalRevenue: Number(sales.totalRevenue),
      itemsSold: Number(sales.itemsSold),
      activeProducts: Number(products.activeProducts),
      topProducts,
      salesTrend,
      totalProfit: Number(finance.totalProfit),
      totalExpenses: Number(finance.totalExpenses),
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
});

export default router;
