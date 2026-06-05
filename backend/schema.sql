-- PostgreSQL Schema for Receipt App

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories (default + custom)
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#4CAF50',
  is_default BOOLEAN DEFAULT FALSE,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);

-- Receipts
CREATE TABLE IF NOT EXISTS receipts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_name VARCHAR(255),
  receipt_date DATE NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2),
  tax DECIMAL(10, 2),
  
  -- Source info
  source VARCHAR(50), -- 'camera', 'manual', 'email', 'amazon', 'walmart'
  source_order_id VARCHAR(255), -- For store API integrations
  image_url VARCHAR(500),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX(user_id, receipt_date DESC),
  INDEX(user_id, created_at DESC),
  UNIQUE(user_id, source_order_id) -- Prevent duplicate imports
);

-- Receipt items
CREATE TABLE IF NOT EXISTS receipt_items (
  id SERIAL PRIMARY KEY,
  receipt_id INTEGER NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit_price DECIMAL(10, 2),
  cost DECIMAL(10, 2) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  
  -- For store integrations
  source_item_id VARCHAR(255),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX(receipt_id),
  INDEX(category_id)
);

-- Budget limits (optional feature)
CREATE TABLE IF NOT EXISTS budget_limits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id),
  monthly_limit DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, category_id)
);

-- Store API credentials (encrypted)
CREATE TABLE IF NOT EXISTS store_credentials (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_name VARCHAR(50),
  encrypted_credentials TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  last_synced_at TIMESTAMP,
  sync_status VARCHAR(20), -- 'active', 'error', 'expired'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, store_name),
  INDEX(user_id)
);

-- Create default categories for each user
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (user_id, name, color, is_default) VALUES
    (NEW.id, 'Groceries', '#4CAF50', TRUE),
    (NEW.id, 'Dining & Takeout', '#FF9800', TRUE),
    (NEW.id, 'Household & Supplies', '#2196F3', TRUE),
    (NEW.id, 'Personal Care', '#E91E63', TRUE),
    (NEW.id, 'Clothing', '#673AB7', TRUE),
    (NEW.id, 'Transportation', '#F44336', TRUE),
    (NEW.id, 'Entertainment', '#00BCD4', TRUE),
    (NEW.id, 'Medical & Health', '#8BC34A', TRUE),
    (NEW.id, 'Utilities & Services', '#9C27B0', TRUE),
    (NEW.id, 'Other', '#757575', TRUE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_default_categories_trigger
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_default_categories();

-- Create indexes for performance
CREATE INDEX idx_receipts_user_date ON receipts(user_id, receipt_date DESC);
CREATE INDEX idx_receipts_user_created ON receipts(user_id, created_at DESC);
CREATE INDEX idx_items_receipt ON receipt_items(receipt_id);
CREATE INDEX idx_items_category ON receipt_items(category_id);
CREATE INDEX idx_categories_user ON categories(user_id);

-- Update updated_at on changes
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_receipts_timestamp BEFORE UPDATE ON receipts
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_items_timestamp BEFORE UPDATE ON receipt_items
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_categories_timestamp BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_timestamp();
