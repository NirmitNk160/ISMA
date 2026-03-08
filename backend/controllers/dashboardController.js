import db from "../config/db.js";

/* ================= DASHBOARD DATA ================= */
export const getDashboard = async (req, res) => {
  const userId = req.user.id;

  try {
    /* SALES SNAPSHOT */
    const [[sales]] = await db.query(
      `SELECT
        COALESCE(SUM(total_price), 0) AS totalRevenue,
        COALESCE(SUM(quantity), 0) AS itemsSold
      FROM sales
      WHERE user_id = ?`,
      [userId]
    );

    /* PRODUCTS */
    const [[products]] = await db.query(
      `SELECT COUNT(*) AS activeProducts
       FROM products
       WHERE user_id = ?`,
      [userId]
    );

    /* TOP PRODUCTS */
    const [topProducts] = await db.query(
      `SELECT
        product_name AS name,
        SUM(quantity) AS sold
       FROM sales
       WHERE user_id = ?
       GROUP BY product_id, product_name
       ORDER BY sold DESC
       LIMIT 5`,
      [userId]
    );

    /* SALES TREND */
    const [salesTrend] = await db.query(
      `SELECT
        DATE(s.created_at) AS date,
        SUM(s.total_price) AS revenue,
        COUNT(DISTINCT s.bill_id) AS orders,
        SUM(s.total_price) - SUM(COALESCE(p.cost_price,0) * s.quantity) AS profit,
        SUM(COALESCE(p.cost_price,0) * s.quantity) AS expenses
       FROM sales s
       JOIN products p ON p.id = s.product_id
       WHERE s.user_id = ?
       AND s.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY DATE(s.created_at)
       ORDER BY date ASC`,
      [userId]
    );

    /* SALES BY CATEGORY */
    const [salesByCategory] = await db.query(
      `SELECT
        p.category,
        SUM(s.quantity) AS sold
       FROM sales s
       JOIN products p ON p.id = s.product_id
       WHERE s.user_id = ?
       GROUP BY p.category
       ORDER BY sold DESC`,
      [userId]
    );

    /* EXPENSE + PROFIT */
    const [[finance]] = await db.query(
      `SELECT
        COALESCE(SUM(p.cost_price * s.quantity), 0) AS totalExpenses,
        COALESCE(SUM(s.total_price), 0) -
        COALESCE(SUM(p.cost_price * s.quantity), 0) AS totalProfit
       FROM sales s
       JOIN products p ON p.id = s.product_id
       WHERE s.user_id = ?`,
      [userId]
    );

    /* ================= EXTRA METRICS ================= */

    /* TODAY SALES */
    const [[todaySales]] = await db.query(
      `SELECT
        COALESCE(SUM(total_price),0) AS todaySales
       FROM sales
       WHERE user_id = ?
       AND DATE(created_at) = CURDATE()`,
      [userId]
    );

    /* INVENTORY VALUE */
    const [[inventory]] = await db.query(
      `SELECT
        COALESCE(SUM(stock * cost_price),0) AS inventoryValue
       FROM products
       WHERE user_id = ?
       AND is_deleted = FALSE`,
      [userId]
    );

    /* OUT OF STOCK */
    const [[outStock]] = await db.query(
      `SELECT
        COUNT(*) AS outOfStock
       FROM products
       WHERE user_id = ?
       AND stock = 0
       AND is_deleted = FALSE`,
      [userId]
    );

    /* DEAD STOCK (no sale in 30+ days) */
    const [deadStock] = await db.query(
      `SELECT
        p.name,
        MAX(s.created_at) AS lastSaleDate,
        DATEDIFF(CURDATE(), MAX(s.created_at)) AS daysWithoutSale
       FROM products p
       LEFT JOIN sales s ON s.product_id = p.id
       WHERE p.user_id = ?
       GROUP BY p.id
       HAVING daysWithoutSale > 30 OR daysWithoutSale IS NULL
       ORDER BY daysWithoutSale DESC
       LIMIT 5`,
      [userId]
    );

    /* LOW PROFIT PRODUCTS */
    const [lowProfitProducts] = await db.query(
      `SELECT
        s.product_name AS name,
        SUM(s.total_price) -
        SUM(p.cost_price * s.quantity) AS profit
       FROM sales s
       JOIN products p ON p.id = s.product_id
       WHERE s.user_id = ?
       GROUP BY s.product_id, s.product_name
       ORDER BY profit ASC
       LIMIT 5`,
      [userId]
    );

    /* MONTHLY REVENUE */
    const [[monthlyRevenue]] = await db.query(
      `SELECT
        COALESCE(SUM(total_price),0) AS monthRevenue
       FROM sales
       WHERE user_id = ?
       AND MONTH(created_at) = MONTH(CURDATE())
       AND YEAR(created_at) = YEAR(CURDATE())`,
      [userId]
    );

    /* ================= RESPONSE ================= */

    res.json({
      totalRevenue: Number(sales.totalRevenue),
      itemsSold: Number(sales.itemsSold),
      activeProducts: Number(products.activeProducts),

      totalProfit: Number(finance.totalProfit),
      totalExpenses: Number(finance.totalExpenses),

      todaySales: Number(todaySales.todaySales),
      inventoryValue: Number(inventory.inventoryValue),
      outOfStock: Number(outStock.outOfStock),

      monthlyRevenue: Number(monthlyRevenue.monthRevenue),

      topProducts,
      salesTrend,
      salesByCategory,

      deadStock,
      lowProfitProducts,
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
};