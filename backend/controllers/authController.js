import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";
import { sendOTPEmail } from "../services/emailService.js";

/* ================= REGISTER ================= */
export const register = async (req, res) => {
  try {
    // Validate input using Zod
    const validatedData = registerSchema.parse(req.body);

    const { shop_name, owner_name, username, email, mobile, password } =
      validatedData;

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      `INSERT INTO users 
   (shop_name, owner_name, username, email, mobile, password, otp, otp_expires)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        shop_name,
        owner_name,
        username,
        email,
        mobile,
        hashedPassword,
        otp,
        otpExpires,
      ],
    );

    await sendOTPEmail(email, otp);

    res.status(201).json({
      message: "OTP sent to your email",
    });
  } catch (err) {
    // Zod validation error → clean message
    if (err.name === "ZodError") {
      return res.status(400).json({
        message: err.errors[0].message,
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

/* ================= VERIFY OTP ================= */
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT otp, otp_expires FROM users WHERE email = ?",
      [email],
    );

    if (!rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date(user.otp_expires) < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    await pool.query(
      `UPDATE users
       SET is_verified = TRUE, otp = NULL, otp_expires = NULL
       WHERE email = ?`,
      [email],
    );

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ message: "Server error" });
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
      "SELECT id, username, password, is_verified, role FROM users WHERE email = ?",
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

    if (!user.is_verified) {
      return res.status(403).json({
        message: "Please verify your email first",
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
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

/* ================= UPDATE PROFILE ================= */
export const updateProfile = async (req, res) => {
  try {
    const { shop_name, owner_name, username, mobile } = req.body;

    await pool.query(
      `UPDATE users 
       SET shop_name = ?, owner_name = ?, username = ?, mobile = ?
       WHERE id = ?`,
      [shop_name, owner_name, username, mobile, req.user.id],
    );

    const [rows] = await pool.query(
      `SELECT shop_name, owner_name, username, email, mobile
       FROM users WHERE id = ?`,
      [req.user.id],
    );

    res.json({
      message: "Profile updated",
      user: rows[0],
    });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "Username already exists",
      });
    }

    res.status(500).json({
      message: "Server error",
    });
  }
};
