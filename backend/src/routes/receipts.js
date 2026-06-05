// Receipt API routes
const express = require('express');
const pool = require('../config/database');
const { authenticateRequest } = require('../utils/auth');

const router = express.Router();

// Get all receipts for user
router.get('/', authenticateRequest, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;
    
    // Base query
    let query = `
      SELECT 
        r.id, r.store_name, r.receipt_date, r.total, r.source,
        COUNT(ri.id) as item_count,
        JSON_AGG(JSON_BUILD_OBJECT(
          'id', ri.id, 'name', ri.item_name, 'cost', ri.cost,
          'category_id', ri.category_id
        )) as items
      FROM receipts r
      LEFT JOIN receipt_items ri ON r.id = ri.receipt_id
      WHERE r.user_id = $1
    `;
    
    const params = [req.userId];
    let paramIndex = 2;
    
    // Filters
    if (startDate) {
      query += ` AND r.receipt_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      query += ` AND r.receipt_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    
    query += `
      GROUP BY r.id
      ORDER BY r.receipt_date DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total FROM receipts WHERE user_id = $1
      ${startDate ? ` AND receipt_date >= '${startDate}'` : ''}
      ${endDate ? ` AND receipt_date <= '${endDate}'` : ''}
    `;
    const countResult = await pool.query(countQuery, [req.userId]);
    
    res.json({
      receipts: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get receipt detail
router.get('/:receiptId', authenticateRequest, async (req, res, next) => {
  try {
    const receipt = await pool.query(
      `SELECT * FROM receipts WHERE id = $1 AND user_id = $2`,
      [req.params.receiptId, req.userId]
    );
    
    if (receipt.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    
    const items = await pool.query(
      `SELECT * FROM receipt_items WHERE receipt_id = $1 ORDER BY id`,
      [req.params.receiptId]
    );
    
    res.json({
      receipt: { ...receipt.rows[0], items: items.rows }
    });
  } catch (error) {
    next(error);
  }
});

// Create receipt
router.post('/', authenticateRequest, async (req, res, next) => {
  try {
    const { storeName, receiptDate, total, subtotal, tax, source, items } = req.body;
    
    // Validate
    if (!storeName || !receiptDate || !total) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert receipt
      const receiptResult = await client.query(
        `INSERT INTO receipts (user_id, store_name, receipt_date, total, subtotal, tax, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [req.userId, storeName, receiptDate, total, subtotal || null, tax || null, source || 'manual']
      );
      
      const receiptId = receiptResult.rows[0].id;
      
      // Insert items
      const insertedItems = [];
      if (items && items.length > 0) {
        for (const item of items) {
          const itemResult = await client.query(
            `INSERT INTO receipt_items (receipt_id, item_name, quantity, cost, category_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [receiptId, item.name, item.quantity || 1, item.cost, item.categoryId || null]
          );
          insertedItems.push(itemResult.rows[0]);
        }
      }
      
      await client.query('COMMIT');
      
      res.status(201).json({
        receipt: { ...receiptResult.rows[0], items: insertedItems }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

// Update receipt
router.put('/:receiptId', authenticateRequest, async (req, res, next) => {
  try {
    const { storeName, receiptDate, total, subtotal, tax } = req.body;
    
    // Verify ownership
    const receipt = await pool.query(
      'SELECT id FROM receipts WHERE id = $1 AND user_id = $2',
      [req.params.receiptId, req.userId]
    );
    
    if (receipt.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    
    const result = await pool.query(
      `UPDATE receipts 
       SET store_name = COALESCE($1, store_name),
           receipt_date = COALESCE($2, receipt_date),
           total = COALESCE($3, total),
           subtotal = COALESCE($4, subtotal),
           tax = COALESCE($5, tax)
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [storeName, receiptDate, total, subtotal, tax, req.params.receiptId, req.userId]
    );
    
    res.json({ receipt: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Delete receipt
router.delete('/:receiptId', authenticateRequest, async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM receipts WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.receiptId, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    
    res.json({ success: true, deletedId: result.rows[0].id });
  } catch (error) {
    next(error);
  }
});

// Update item category
router.put('/:receiptId/items/:itemId/category', authenticateRequest, async (req, res, next) => {
  try {
    const { categoryId } = req.body;
    
    // Verify receipt ownership
    const receipt = await pool.query(
      'SELECT id FROM receipts WHERE id = $1 AND user_id = $2',
      [req.params.receiptId, req.userId]
    );
    
    if (receipt.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    
    // Verify category belongs to user
    const category = await pool.query(
      'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
      [categoryId, req.userId]
    );
    
    if (category.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Update item
    const result = await pool.query(
      'UPDATE receipt_items SET category_id = $1 WHERE id = $2 AND receipt_id = $3 RETURNING *',
      [categoryId, req.params.itemId, req.params.receiptId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ item: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
