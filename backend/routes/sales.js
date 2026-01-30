import express from "express";
import pool from "../db.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      `
      SELECT
        bill_id,
        product_name,
        quantity,
        unit_price,
        total_price,
        status,
        created_at
      FROM sales
      WHERE user_id = ?
        AND bill_id IS NOT NULL
      ORDER BY created_at DESC
      `,
      [userId]
    );

    // 👇 FORCE numeric types (kills string concat bugs)
    const clean = rows.map(r => ({
      ...r,
      quantity: Number(r.quantity),
      unit_price: Number(r.unit_price),
      total_price: Number(r.total_price),
    }));

    res.json(clean);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sales" });
  }
});

export default router;
