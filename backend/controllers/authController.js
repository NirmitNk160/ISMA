import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

/* ================= REGISTER ================= */
export const register = async (req, res) => {
  const { shop_name, owner_name, username, email, mobile, password } =
    req.body;

  if (
    !shop_name ||
    !owner_name ||
    !username ||
    !email ||
    !mobile ||
    !password
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (shop_name, owner_name, username, email, mobile, password)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [shop_name, owner_name, username, email, mobile, hashedPassword]
    );

    res.json({ message: "Registration successful" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "Email or username already exists",
      });
    }

    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT id, username, password FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= PROFILE ================= */
export const profile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT shop_name, owner_name, username, email, mobile FROM users WHERE id = ?",
      [req.user.id]
    );

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "DB error" });
  }
};