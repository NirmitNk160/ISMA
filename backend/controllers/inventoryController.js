import db from "../config/db.js";

/* ADD PRODUCT */
export const addProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      size,
      stock,
      price,
      cost_price = 0,
      description,
      barcode,
      sku,
      image_url,
      min_stock = 5,
      expiry_date = null,
      supplier_id = null,
    } = req.body;

    const userId = req.user.id;

    if (!name || !category || stock === "" || price === "") {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (Number(stock) < 0 || Number(price) < 0 || Number(cost_price) < 0) {
      return res
        .status(400)
        .json({ message: "Stock and prices must be non-negative" });
    }

    await db.query(
      `INSERT INTO products
      (user_id, name, brand, category, size, stock, price, cost_price,
       description, barcode, sku, image_url, min_stock,
       expiry_date, supplier_id, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
      [
        userId,
        name,
        brand || null,
        category,
        size || null,
        Number(stock),
        Number(price),
        Number(cost_price),
        description || null,
        barcode || null,
        sku || null,
        image_url || null,
        Number(min_stock),
        expiry_date || null,
        supplier_id || null,
      ],
    );

    res.status(201).json({ message: "Product added" });
  } catch (err) {
    console.error("Add product error:", err);
    res.status(500).json({ message: "DB error" });
  }
};

/* LOW STOCK */
export const lowStock = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `SELECT id, name, stock, min_stock
       FROM products
       WHERE user_id = ?
       AND is_deleted = FALSE
       AND stock <= min_stock
       ORDER BY stock ASC`,
      [userId],
    );

    res.json(rows);
  } catch {
    res.status(500).json({ message: "Failed to fetch low stock products" });
  }
};

/* EXPIRY ALERT */
export const expiryAlerts = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `SELECT id, name, expiry_date
       FROM products
       WHERE user_id = ?
       AND expiry_date IS NOT NULL
       AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
       AND is_deleted = FALSE
       ORDER BY expiry_date ASC`,
      [userId],
    );

    res.json(rows);
  } catch {
    res.status(500).json({ message: "Failed to fetch expiry alerts" });
  }
};

/* BARCODE SEARCH */
export const barcodeSearch = async (req, res) => {
  try {
    const userId = req.user.id;
    const code = req.params.code;

    const [rows] = await db.query(
      `SELECT id, name, brand, category, size, price, cost_price,
              stock, barcode, image_url, supplier_id
       FROM products
       WHERE barcode=? AND user_id=? AND is_deleted=FALSE
       LIMIT 1`,
      [code, userId],
    );

    if (!rows.length)
      return res.status(404).json({ message: "Product not found" });

    res.json(rows[0]);
  } catch {
    res.status(500).json({ message: "DB error" });
  }
};

/* GET ALL */
export const getAllProducts = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `SELECT p.*, s.name AS supplier_name,
              s.company_name AS supplier_company,
              CASE
                WHEN p.stock = 0 THEN 'Out'
                WHEN p.stock < 15 THEN 'Low'
                ELSE 'In Stock'
              END AS status,
              EXISTS(
                SELECT 1 FROM sales s2 WHERE s2.product_id = p.id
              ) AS hasSales
       FROM products p
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.user_id=? AND p.is_deleted=FALSE
       ORDER BY p.created_at DESC`,
      [userId],
    );

    res.json(rows);
  } catch {
    res.status(500).json({ message: "DB error" });
  }
};

/* SOFT DELETE */
export const archiveProduct = async (req, res) => {
  try {
    await db.query(
      `UPDATE products SET is_deleted=TRUE WHERE id=? AND user_id=?`,
      [req.params.id, req.user.id],
    );

    res.json({ message: "Product archived successfully" });
  } catch {
    res.status(500).json({ message: "DB error" });
  }
};

/* GET SINGLE PRODUCT */
export const getSingleProduct = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT name, brand, category, size, stock,
              price, cost_price, description, barcode,
              sku, image_url, min_stock, expiry_date,
              supplier_id
       FROM products
       WHERE id=? AND user_id=? AND is_deleted=FALSE`,
      [req.params.id, req.user.id],
    );

    if (!rows.length)
      return res.status(404).json({ message: "Product not found" });

    res.json(rows[0]);
  } catch {
    res.status(500).json({ message: "DB error" });
  }
};

/* UPDATE PRODUCT */
export const updateProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      size,
      stock,
      price,
      cost_price = 0,
      description,
      barcode,
      sku,
      image_url,
      min_stock = 5,
      expiry_date = null,
      supplier_id = null,
    } = req.body;

    const [result] = await db.query(
      `UPDATE products SET
        name=?, brand=?, category=?, size=?,
        stock=?, price=?, cost_price=?,
        description=?, barcode=?, sku=?,
        image_url=?, min_stock=?, expiry_date=?,
        supplier_id=?
      WHERE id=? AND user_id=? AND is_deleted=FALSE`,
      [
        name,
        brand || null,
        category,
        size || null,
        Number(stock),
        Number(price),
        Number(cost_price),
        description || null,
        barcode || null,
        sku || null,
        image_url || null,
        Number(min_stock),
        expiry_date || null,
        supplier_id || null,
        req.params.id,
        req.user.id,
      ],
    );

    if (!result.affectedRows)
      return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product updated" });
  } catch {
    res.status(500).json({ message: "DB error" });
  }
};

/* ARCHIVED PRODUCTS */
export const archivedProducts = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, brand, category, size,
              stock, price, cost_price, description,
              barcode, image_url, sku, supplier_id
       FROM products
       WHERE user_id=? AND is_deleted=TRUE
       ORDER BY created_at DESC`,
      [req.user.id],
    );

    res.json(rows);
  } catch {
    res.status(500).json({ message: "DB error" });
  }
};

/* RESTORE PRODUCT */
export const restoreProduct = async (req, res) => {
  try {
    await db.query(
      `UPDATE products SET is_deleted=FALSE WHERE id=? AND user_id=?`,
      [req.params.id, req.user.id],
    );

    res.json({ message: "Product restored" });
  } catch {
    res.status(500).json({ message: "DB error" });
  }
};
