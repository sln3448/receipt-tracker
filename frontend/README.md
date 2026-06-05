# Receipt Tracker Frontend

Next.js 14 frontend for the Receipt Tracker app.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   # .env.local already configured, but adjust if needed
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

Frontend runs on `http://localhost:3000`

## Features

### Pages
- **Home** - Landing page with feature overview
- **Login** - User authentication
- **Register** - New account creation
- **Dashboard** - Main dashboard with spending overview and pie charts
- **Receipts** - View, create, and manage receipts
- **Receipt Detail** - View receipt items and categorize them
- **Categories** - Manage default and custom categories
- **Analytics** - Advanced spending insights with time range filters

### Components
- Header with navigation and user menu
- Receipt cards with delete functionality
- Receipt form for creating/editing
- Category management UI
- Analytics charts (Pie, Bar, Line)

### Hooks
- `useAuth()` - Authentication context
- `useReceipts()` - Receipt CRUD operations
- `useCategories()` - Category management

### Utilities
- `api.js` - Axios HTTP client with JWT
- `format.js` - Currency, date, and utility functions

## Tech Stack
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Axios
- Recharts for analytics

## API Integration

All API calls go through `utils/api.js` which automatically:
- Adds JWT bearer token to requests
- Handles 401 responses (redirect to login)
- Provides convenience methods for auth, receipts, categories

## Styling

Tailwind CSS with custom globals in `app/globals.css`. Dark mode can be enabled in `tailwind.config.js`.
