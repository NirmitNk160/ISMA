import db from "../config/db.js";

/* ================= ADD SUPPLIER ================= */
export const addSupplier = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, company_name, phone, email, address, gst_number, notes } =
      req.body;

    if (!name) {
      return res.status(400).json({ message: "Supplier name required" });
    }

    await db.query(
      `INSERT INTO suppliers
       (user_id, name, company_name, phone, email, address, gst_number, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, company_name, phone, email, address, gst_number, notes]
    );

    res.status(201).json({ message: "Supplier added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
};

/* ================= GET ALL ================= */
export const getSuppliers = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `SELECT * FROM suppliers
       WHERE user_id=?
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(rows);
  } catch {
    res.status(500).json({ message: "DB error" });
  }
};

/* ================= GET SINGLE ================= */
export const getSupplierById = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `SELECT * FROM suppliers
       WHERE id=? AND user_id=?`,
      [req.params.id, userId]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Supplier not found" });

    res.json(rows[0]);
  } catch {
    res.status(500).json({ message: "DB error" });
  }
};

/* ================= UPDATE ================= */
export const updateSupplier = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, company_name, phone, email, address, gst_number, notes } =
      req.body;

    await db.query(
      `UPDATE suppliers SET
        name=?, company_name=?, phone=?, email=?,
        address=?, gst_number=?, notes=?
       WHERE id=? AND user_id=?`,
      [
        name,
        company_name,
        phone,
        email,
        address,
        gst_number,
        notes,
        req.params.id,
        userId,
      ]
    );

    res.json({ message: "Supplier updated" });
  } catch {
    res.status(500).json({ message: "DB error" });
  }
};

/* ================= DELETE ================= */
export const deleteSupplier = async (req, res) => {
  try {
    const userId = req.user.id;

    await db.query("DELETE FROM suppliers WHERE id=? AND user_id=?", [
      req.params.id,
      userId,
    ]);

    res.json({ message: "Supplier deleted" });
  } catch {
    res.status(500).json({ message: "DB error" });
  }
};