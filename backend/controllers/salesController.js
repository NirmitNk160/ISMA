import db from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================= GET SALES ================= */
export const getSales = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      `SELECT
        s.bill_id,
        s.product_id,
        s.product_name,
        s.quantity,
        s.unit_price,
        s.total_price,
        s.created_at
      FROM sales s
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC`,
      [userId],
    );

    res.json(rows);
  } catch (err) {
    console.error("Sales fetch error:", err);
    res.status(500).json({ message: "Failed to fetch sales" });
  }
};

/* ================= DOWNLOAD INVOICE ================= */
export const downloadInvoice = async (req, res) => {
  try {
    const { billId } = req.params;

    const invoicePath = path.join(
      __dirname,
      "..",
      "invoices",
      `invoice-${billId}.pdf`,
    );

    console.log("Looking for:", invoicePath);

    if (!fs.existsSync(invoicePath)) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.download(invoicePath, `invoice-${billId}.pdf`);
  } catch (err) {
    console.error("Invoice download error:", err);
    res.status(500).json({ message: "Failed to download invoice" });
  }
};
