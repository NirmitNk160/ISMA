import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";

/* ================= REGISTER ================= */
export const register = async (req, res) => {
  try {
    // Validate input using Zod
    const validatedData = registerSchema.parse(req.body);

    const { shop_name, owner_name, username, email, mobile, password } =
      validatedData;

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users 
       (shop_name, owner_name, username, email, mobile, password)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [shop_name, owner_name, username, email, mobile, hashedPassword],
    );

    res.status(201).json({
      message: "Registration successful",
    });
  } catch (err) {
    // Zod validation error → clean message
    if (err.name === "ZodError") {
      return res.status(400).json({
        message: "Please enter valid details",
      });
    }

    // Duplicate user
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "Account already exists",
      });
    }

    console.error("REGISTER ERROR:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation only
  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, username, password FROM users WHERE email = ?",
      [email],
    );

    // Email not found
    if (!rows.length) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const user = rows[0];

    // Password check
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
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
      `SELECT shop_name, owner_name, username, email, mobile
       FROM users WHERE id = ?`,
      [req.user.id],
    );

    if (!rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({ message: "DB error" });
  }
};
