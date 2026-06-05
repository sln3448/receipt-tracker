// Auth API routes
const express = require('express');
const pool = require('../config/database');
const { hashPassword, comparePassword, generateToken, authenticateRequest } = require('../utils/auth');

const router = express.Router();

// Register user
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    
    // Check if user exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Hash password & create user
    const passwordHash = await hashPassword(password);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email',
      [email, passwordHash, firstName || '', lastName || '']
    );
    
    const user = result.rows[0];
    const token = generateToken(user.id);
    
    res.status(201).json({
      user: { id: user.id, email: user.email },
      token
    });
  } catch (error) {
    next(error);
  }
});

// Login user
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Get user
    const result = await pool.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const passwordMatch = await comparePassword(password, user.password_hash);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(user.id);
    
    res.json({
      user: { id: user.id, email: user.email },
      token
    });
  } catch (error) {
    next(error);
  }
});

// Get current user profile
router.get('/profile', authenticateRequest, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = $1',
      [req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Update profile
router.put('/profile', authenticateRequest, async (req, res, next) => {
  try {
    const { firstName, lastName } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3 RETURNING id, email, first_name, last_name',
      [firstName || '', lastName || '', req.userId]
    );
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
