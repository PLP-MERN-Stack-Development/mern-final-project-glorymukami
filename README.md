# 🏆 ShopSphere - Full Stack E-Commerce Platform

## 🌐 Live Demo
- **Frontend**: https://mern-final-project-glorymukami-swkf.vercel.app
- **Backend API**: https://mern-final-project-glorymukami.onrender.com
- **GitHub**: https://github.com/PLP-MERN-Stack-Development/mern-final-project-glorymukami.git

## 📋 Features
- ✅ User Authentication & Authorization
- ✅ Product Catalog & Search
- ✅ Shopping Cart & Checkout
- ✅ Order Management
- ✅ Product Reviews & Ratings
- ✅ Admin Dashboard
- ✅ Payment Integration (Stripe)
- ✅ Responsive Design

## 🛠️ Tech Stack
### Frontend
- React 18 + Vite 5
- Tailwind CSS 4
- React Router DOM
- Axios for API calls
- Context API for state management

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Stripe Payment Integration
- CORS enabled

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Stripe account (for payments)

### Environment Setup
**Backend (.env)**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shopsphere
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
STRIPE_SECRET_KEY=sk_live_your_stripe_key
CLIENT_URL=https://your-shopsphere-app.vercel.app
Frontend (.env)

env
VITE_API_BASE_URL=https://your-shopsphere-api.railway.app/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
Installation
bash
# Backend
cd backend
npm install
npm run dev

# Frontend  
cd frontend
npm install
npm run dev
📁 Project Structure
text
shopshere/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & error handling
│   └── app.js          # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # State management
│   │   └── services/    # API services
│   └── package.json
└── README.md
🚀 Deployment
Frontend (Vercel)
Push code to GitHub

Connect repo to Vercel

Add environment variables

Deploy automatically

Backend (Railway/Render)
Connect GitHub repo

Set environment variables

Automatic deployment on push

Database (MongoDB Atlas)
Create free cluster

Get connection string

Add to environment variables

🔧 API Endpoints
POST /api/auth/login - User login

POST /api/auth/register - User registration

GET /api/products - Get all products

POST /api/orders - Create order

GET /api/orders/my-orders - Get user orders

GET /api/admin/dashboard - Admin statistics

👑 Admin Features
View sales analytics

Manage users & products

Process orders

Generate reports

🛒 User Features
Browse products

Add to cart

Checkout & place orders

Track order status

Leave reviews

🔒 Security Features
JWT authentication

Password encryption

Input validation

CORS configuration

Rate limiting

📞 Support
For issues or questions:

Create GitHub issue

Email: your-email@example.com

📄 License
MIT License - see LICENSE file for details

Built with ❤️ for MERN Stack Capstone Project

