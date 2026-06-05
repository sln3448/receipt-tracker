# Installation & Running

This is a full-stack receipt tracking application with a Node.js/Express backend and Next.js frontend.

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

### Configure PostgreSQL

```bash
# Create database
creatdb receipt_app

# Initialize schema
psql -U postgres -d receipt_app -f schema.sql
```

### Edit .env

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/receipt_app
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key
```

### Start Backend

```bash
npm run dev
# Server runs on http://localhost:5000
```

## Frontend Setup

```bash
cd frontend
npm install
```

### Start Frontend

```bash
npm run dev
# App runs on http://localhost:3000
```

## Testing

1. Go to http://localhost:3000
2. Register a new account
3. Add receipts with items
4. Categorize items
5. View analytics dashboard

## Production Build

**Backend:**
```bash
npm run build
npm start
```

**Frontend:**
```bash
npm run build
npm start
```
