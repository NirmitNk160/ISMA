import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";
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

    db.query(
      sql,
      [shop_name, owner_name, username, email, mobile, hashedPassword],
      (err) => {
        if (err) {
          return res.status(500).json({
            message: err.sqlMessage || "Database error",
          });
        }

        res.json({
          success: true,
          message: "Registration successful",
        });
      }
    );
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (results.length === 0)
      return res.status(401).json({ message: "User not found" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
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
  });
});

/* ================= GET LOGGED IN USER ================= */
router.get("/me", verifyToken, (req, res) => {
  const sql =
    "SELECT id, shop_name, owner_name, username, email, mobile FROM users WHERE id = ?";

  db.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ user: results[0] });
  });
});

export default router;
