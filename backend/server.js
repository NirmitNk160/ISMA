import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import inventoryRoutes from "./routes/inventory.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// test root
app.get("/", (req, res) => {
  res.send("✅ ISMA Backend Running");
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
