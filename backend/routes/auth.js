import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  const { shop_name, owner_name, username, email, mobile, password } = req.body;

  if (!shop_name || !owner_name || !username || !email || !mobile || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (shop_name, owner_name, username, email, mobile, password)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await pool.query(sql, [
      shop_name,
      owner_name,
      username,
      email,
      mobile,
      hashedPassword,
    ]);

    return res.json({
      success: true,
      message: "Registration successful",
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        shop_name: user.shop_name,
        owner_name: user.owner_name,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ================= GET LOGGED IN USER ================= */
router.get("/me", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, shop_name, owner_name, username, email, mobile FROM users WHERE id = ?",
      [req.user.id]
    );

    return res.json({ user: rows[0] });
  } catch (err) {
    return res.status(500).json({ message: "DB error" });
  }
});

export default router;
