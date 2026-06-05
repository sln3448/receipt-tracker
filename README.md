# Receipt Tracker - Full Stack Application

💰 Personal expense tracking app that lets users upload/capture store receipts and categorize individual items for spending insights.

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env

# Setup PostgreSQL
creatdb receipt_app
psql -U postgres -d receipt_app -f schema.sql

# Start server (runs on :5000)
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install

# Start dev server (runs on :3000)
npm run dev
```

## 📁 Project Structure

```
receipt-tracker/
├── backend/
│   ├── src/
│   │   ├── server.js              # Express entry point
│   │   ├── config/database.js     # PostgreSQL connection
│   │   ├── utils/auth.js          # JWT & password utilities
│   │   └── routes/
│   │       ├── auth.js            # Auth endpoints
│   │       ├── receipts.js        # Receipt CRUD
│   │       └── categories.js      # Category management
│   ├── schema.sql                 # Database schema
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
└── frontend/
    ├── app/
    │   ├── layout.js              # Root layout
    │   ├── page.js                # Home page
    │   ├── login/                 # Login page
    │   ├── register/              # Registration page
    │   └── dashboard/             # Protected routes
    │       ├── page.js            # Dashboard
    │       ├── receipts/          # Receipt list & detail
    │       ├── categories/        # Category management
    │       └── analytics/         # Spending analytics
    ├── components/                # Reusable components
    ├── context/AuthContext.js     # Auth provider
    ├── hooks/                     # Custom React hooks
    ├── utils/                     # Helpers (API, format)
    ├── app/globals.css            # Global styles
    ├── package.json
    ├── tailwind.config.js
    ├── next.config.js
    └── README.md
```

## 🛠 Tech Stack

**Backend:**
- Node.js + Express
- PostgreSQL
- JWT Authentication
- bcrypt password hashing

**Frontend:**
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Axios
- Recharts (analytics)

## 📊 Key Features

✅ **User Authentication** - Secure register/login with JWT  
✅ **Receipt Management** - Create, view, edit, delete receipts  
✅ **Item Categorization** - Assign items to categories  
✅ **Dashboard** - Spending overview with pie charts  
✅ **Analytics** - Time-filtered spending insights  
✅ **Category Management** - Default + custom categories  
✅ **Responsive Design** - Mobile-friendly UI with Tailwind  
✅ **Real-time Updates** - React hooks for instant feedback  

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Receipts
- `GET /api/receipts` - List receipts (paginated, protected)
- `GET /api/receipts/:id` - Get receipt detail (protected)
- `POST /api/receipts` - Create receipt (protected)
- `PUT /api/receipts/:id` - Update receipt (protected)
- `DELETE /api/receipts/:id` - Delete receipt (protected)
- `PUT /api/receipts/:id/items/:itemId/category` - Categorize item (protected)

### Categories
- `GET /api/categories` - List categories (protected)
- `POST /api/categories` - Create category (protected)
- `PUT /api/categories/:id` - Update category (protected)
- `DELETE /api/categories/:id` - Delete category (protected)
- `GET /api/categories/:id/summary` - Category spending (protected)

## 🔐 Security

- JWT tokens for stateless authentication
- bcryptjs for password hashing (10 rounds)
- CORS configured for frontend origin
- Protected routes with auth middleware
- Parameterized SQL queries to prevent injection
- User isolation (can only access own data)

## 🚢 Deployment

**Backend**: Railway, Render, Heroku  
**Frontend**: Vercel, Netlify  
**Database**: PostgreSQL (RDS, Railway, etc)  
**Storage**: Optional S3 for receipt images

## 📝 Next Steps

### Phase 2 (Coming Soon)
- [ ] Google Vision API OCR integration
- [ ] Receipt image upload & processing
- [ ] Firebase Realtime sync for mobile
- [ ] Mobile app (React Native)
- [ ] Email receipt import

### Phase 3 (Future)
- [ ] Store API integrations (Amazon, Walmart)
- [ ] Machine learning categorization
- [ ] Budget alerts & notifications
- [ ] Multi-user sharing
- [ ] Advanced reporting

## 📄 License

MIT
