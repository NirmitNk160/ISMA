import express from "express";
import db from "../db.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      `
      SELECT
        s.bill_id,
        s.product_id,
        s.product_name,
        s.quantity,
        s.unit_price,
        s.total_price,
        s.created_at
      FROM sales s
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
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