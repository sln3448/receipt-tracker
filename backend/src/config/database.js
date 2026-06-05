// Database configuration
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/receipt_app',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL');
});

pool.on('error', (error) => {
  console.error('Unexpected error on idle client', error);
});

module.exports = pool;
