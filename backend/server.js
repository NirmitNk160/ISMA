import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import inventoryRoutes from "./routes/inventory.js";
import billingRoutes from "./routes/billing.js";
import salesRoutes from "./routes/sales.js";
import dashboardRoutes from "./routes/dashboard.js";

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://192.168.29.200:5173", // ✅ phone access
    ],
    credentials: true,
  })
);

app.use(express.json());

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.send("✅ ISMA Backend Running");
});

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/dashboard", dashboardRoutes);

/* ================= ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({ message: "Internal server error" });
});

/* ================= START ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});