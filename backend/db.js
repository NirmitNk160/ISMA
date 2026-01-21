import dotenv from "dotenv";
dotenv.config(); // 🔥 REQUIRED HERE

import mysql from "mysql2";

// DEBUG (keep for now)
console.log("DB ENV CHECK →", {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD ? "SET" : "EMPTY",
  DB_NAME: process.env.DB_NAME,
});

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Database connected to ISMA");
  }
});

export default db;
