# Receipt Tracker - Backend

Node.js/Express backend for the Receipt Tracker app.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create database**
   ```bash
   createdb receipt_app
   ```

3. **Initialize schema**
   ```bash
   psql -U postgres -d receipt_app -f schema.sql
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

5. **Start server**
   ```bash
   npm run dev
   ```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Receipts
- `GET /api/receipts` - List receipts (protected)
- `GET /api/receipts/:id` - Get receipt detail (protected)
- `POST /api/receipts` - Create receipt (protected)
- `PUT /api/receipts/:id` - Update receipt (protected)
- `DELETE /api/receipts/:id` - Delete receipt (protected)
- `PUT /api/receipts/:id/items/:itemId/category` - Update item category (protected)

### Categories
- `GET /api/categories` - List categories (protected)
- `POST /api/categories` - Create category (protected)
- `PUT /api/categories/:id` - Update category (protected)
- `DELETE /api/categories/:id` - Delete category (protected)
- `GET /api/categories/:id/summary` - Category spending (protected)

## Tech Stack
- Node.js + Express
- PostgreSQL
- JWT Authentication
- bcrypt password hashing
