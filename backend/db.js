/* eslint-env node */

import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";

console.log("DB ENV CHECK →", {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD ? "SET" : "EMPTY",
  DB_NAME: process.env.DB_NAME,
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log("✅ MySQL Pool ready for transactions");

export default pool;
