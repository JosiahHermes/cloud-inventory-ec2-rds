const express = require('express');
const pool = require('../config/db');

const router = express.Router();

const ALLOWED_STATUSES = ['AVAILABLE', 'IN_USE', 'MAINTENANCE'];

/**
 * Wrap async Express route handlers so errors flow to central error middleware.
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Parse and validate positive integer route :id parameter.
 */
function parseItemId(rawId) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

/**
 * Validate item payload for create (isUpdate=false) and update (isUpdate=true).
 */
function validateItemPayload(body, { isUpdate = false } = {}) {
  const errors = [];
  const data = {};

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: ['Request body harus berupa JSON object.'], data: null };
  }

  if (!isUpdate || body.sku !== undefined) {
    if (typeof body.sku !== 'string' || body.sku.trim() === '') {
      errors.push('Field "sku" wajib berupa string non-kosong.');
    } else {
      data.sku = body.sku.trim();
    }
  }

  if (!isUpdate || body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim() === '') {
      errors.push('Field "name" wajib berupa string non-kosong.');
    } else {
      data.name = body.name.trim();
    }
  }

  if (!isUpdate || body.quantity !== undefined) {
    const qty = body.quantity === undefined ? 0 : Number(body.quantity);
    if (!Number.isInteger(qty) || qty < 0) {
      errors.push('Field "quantity" harus berupa bilangan bulat >= 0.');
    } else {
      data.quantity = qty;
    }
  }

  if (!isUpdate || body.status !== undefined) {
    const status = body.status === undefined ? 'AVAILABLE' : body.status;
    if (!ALLOWED_STATUSES.includes(status)) {
      errors.push(
        `Field "status" harus salah satu dari: ${ALLOWED_STATUSES.join(', ')}.`
      );
    } else {
      data.status = status;
    }
  }

  if (isUpdate && Object.keys(data).length === 0 && errors.length === 0) {
    errors.push('Minimal satu field (sku, name, quantity, status) harus dikirim.');
  }

  return { errors, data };
}

// CREATE: POST /items
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { errors, data } = validateItemPayload(req.body, { isUpdate: false });
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validasi gagal', errors });
    }

    const [result] = await pool.execute(
      'INSERT INTO inventory_items (sku, name, quantity, status) VALUES (?, ?, ?, ?)',
      [data.sku, data.name, data.quantity, data.status]
    );

    const [rows] = await pool.execute(
      'SELECT id, sku, name, quantity, status, updated_at FROM inventory_items WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      message: 'Item berhasil ditambahkan',
      data: rows[0],
    });
  })
);

// READ ALL: GET /items
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(
      'SELECT id, sku, name, quantity, status, updated_at FROM inventory_items ORDER BY id DESC'
    );

    return res.json({
      count: rows.length,
      data: rows,
    });
  })
);

// READ ONE: GET /items/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseItemId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'ID item tidak valid' });
    }

    const [rows] = await pool.execute(
      'SELECT id, sku, name, quantity, status, updated_at FROM inventory_items WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Item tidak ditemukan' });
    }

    return res.json({ data: rows[0] });
  })
);

// UPDATE: PUT /items/:id
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseItemId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'ID item tidak valid' });
    }

    const { errors, data } = validateItemPayload(req.body, { isUpdate: true });
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validasi gagal', errors });
    }

    const fields = Object.keys(data);
    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const values = [...fields.map((field) => data[field]), id];

    const [result] = await pool.execute(
      `UPDATE inventory_items SET ${setClause} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item tidak ditemukan' });
    }

    const [rows] = await pool.execute(
      'SELECT id, sku, name, quantity, status, updated_at FROM inventory_items WHERE id = ?',
      [id]
    );

    return res.json({
      message: 'Item berhasil diperbarui',
      data: rows[0],
    });
  })
);

// DELETE: DELETE /items/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseItemId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'ID item tidak valid' });
    }

    const [result] = await pool.execute(
      'DELETE FROM inventory_items WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item tidak ditemukan' });
    }

    return res.json({ message: 'Item berhasil dihapus' });
  })
);

module.exports = router;
