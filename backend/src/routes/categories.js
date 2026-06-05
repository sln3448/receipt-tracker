// Categories API routes
const express = require('express');
const pool = require('../config/database');
const { authenticateRequest } = require('../utils/auth');

const router = express.Router();

// Get all categories for user
router.get('/', authenticateRequest, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY is_default DESC, name',
      [req.userId]
    );
    
    res.json({ categories: result.rows });
  } catch (error) {
    next(error);
  }
});

// Create custom category
router.post('/', authenticateRequest, async (req, res, next) => {
  try {
    const { name, color, icon } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name required' });
    }
    
    const result = await pool.query(
      'INSERT INTO categories (user_id, name, color, icon, is_default) VALUES ($1, $2, $3, $4, FALSE) RETURNING *',
      [req.userId, name, color || '#4CAF50', icon || '']
    );
    
    res.status(201).json({ category: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint
      return res.status(409).json({ error: 'Category already exists' });
    }
    next(error);
  }
});

// Update category
router.put('/:categoryId', authenticateRequest, async (req, res, next) => {
  try {
    const { name, color, icon } = req.body;
    
    const result = await pool.query(
      `UPDATE categories 
       SET name = COALESCE($1, name),
           color = COALESCE($2, color),
           icon = COALESCE($3, icon)
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [name, color, icon, req.params.categoryId, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ category: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Delete custom category (only if not default)
router.delete('/:categoryId', authenticateRequest, async (req, res, next) => {
  try {
    // Check if category exists and belongs to user
    const category = await pool.query(
      'SELECT * FROM categories WHERE id = $1 AND user_id = $2',
      [req.params.categoryId, req.userId]
    );
    
    if (category.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    if (category.rows[0].is_default) {
      return res.status(400).json({ error: 'Cannot delete default categories' });
    }
    
    // Move items to 'Other' category
    const otherCategory = await pool.query(
      'SELECT id FROM categories WHERE user_id = $1 AND name = $2',
      [req.userId, 'Other']
    );
    
    if (otherCategory.rows.length > 0) {
      await pool.query(
        'UPDATE receipt_items SET category_id = $1 WHERE category_id = $2',
        [otherCategory.rows[0].id, req.params.categoryId]
      );
    }
    
    // Delete category
    await pool.query(
      'DELETE FROM categories WHERE id = $1',
      [req.params.categoryId]
    );
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Get category spending summary
router.get('/:categoryId/summary', authenticateRequest, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT 
        c.id, c.name, c.color,
        COUNT(ri.id) as item_count,
        SUM(ri.cost) as total_spent
       FROM categories c
       LEFT JOIN receipt_items ri ON c.id = ri.category_id
       LEFT JOIN receipts r ON ri.receipt_id = r.id
       WHERE c.id = $1 AND c.user_id = $2
       GROUP BY c.id, c.name, c.color`,
      [req.params.categoryId, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ category: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
