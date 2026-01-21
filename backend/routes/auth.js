import express from "express";
import bcrypt from "bcryptjs";
import db from "../db.js";

const router = express.Router();

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  console.log("🔥 REGISTER HIT:", req.body);

  const { shop_name, owner_name, email, mobile, password } = req.body;

  // validation
  if (!shop_name || !owner_name || !email || !mobile || !password) {
    return res.status(400).json({
      message: "❌ All fields are required",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (shop_name, owner_name, email, mobile, password)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [shop_name, owner_name, email, mobile, hashedPassword],
      (err, result) => {
        if (err) {
          console.error("❌ SQL ERROR:", err);
          return res.status(500).json({
            message: err.sqlMessage || "Database error",
          });
        }

        return res.json({
          success: true,
          message: "✅ Registration successful",
          userId: result.insertId,
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "❌ Email and password required",
    });
  }

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "DB error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "❌ User not found" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "❌ Wrong password" });
    }

    res.json({
      success: true,
      message: "✅ Login successful",
      user: {
        id: user.id,
        shop_name: user.shop_name,
        owner_name: user.owner_name,
      },
    });
  });
});

export default router;
