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
      ORDER BY created_at DESC
      `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Sales fetch error:", err);
    res.status(500).json({ message: "Failed to fetch sales" });
  }
});


export default router;
