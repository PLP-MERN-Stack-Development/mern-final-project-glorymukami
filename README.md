 ShopSphere - Full Stack E-Commerce Platform
🌐 Live Demo
Frontend URL: https://your-shopsphere-app.vercel.app

Backend API: https://your-shopsphere-api.railway.app

GitHub Repository: https://github.com/yourusername/shopsphere-ecommerce

📋 Table of Contents
Project Overview

Features

Tech Stack

Project Structure

Installation & Setup

API Documentation

Deployment

Testing

Presentation

🚀 Project Overview
ShopSphere is a comprehensive full-stack e-commerce platform built with the MERN stack (MongoDB, Express.js, React, Node.js). This project demonstrates advanced web development skills including database design, RESTful API development, real-time features, authentication, payment integration, and deployment.

🎯 Key Objectives
Design and develop a production-ready e-commerce platform

Implement secure user authentication and authorization

Integrate Stripe payment processing

Create an intuitive admin dashboard

Ensure responsive design across all devices

Deploy both frontend and backend to production

✨ Features
🔐 Authentication & User Management
User registration and login with JWT

Password encryption with bcrypt

Role-based access control (Admin/User)

User profiles and order history

Protected routes and middleware

🛍️ Product Management
Product catalog with categories and filters

Advanced search functionality

Product reviews and ratings system

Image upload and management

Inventory tracking

🛒 Shopping Experience
Add/remove items from cart

Persistent shopping cart

Product wishlist

Real-time stock updates

Order tracking

💳 Payment Integration
Stripe payment processing

Secure checkout flow

Order confirmation emails

Payment status tracking

👑 Admin Dashboard
Sales analytics and reporting

User management

Product CRUD operations

Order management

Inventory management

📱 Technical Features
Responsive design with Tailwind CSS

Real-time updates with Socket.io

Form validation and error handling

Image optimization

SEO-friendly structure

🛠️ Tech Stack
Frontend
React 18 - UI framework

Vite 5 - Build tool and dev server

Tailwind CSS 4 - Utility-first CSS framework

React Router DOM - Client-side routing

Axios - HTTP client

Stripe.js - Payment processing

React Hook Form - Form management

Lucide React - Icon library

Backend
Node.js - Runtime environment

Express.js - Web framework

MongoDB - Database

Mongoose - ODM for MongoDB

JWT - Authentication tokens

bcryptjs - Password hashing

Stripe - Payment processing

Socket.io - Real-time communication

Multer - File uploads

CORS - Cross-origin resource sharing

Deployment & Tools
Vercel - Frontend deployment

Railway/Render - Backend deployment

MongoDB Atlas - Cloud database

Git - Version control

Postman - API testing

Chrome DevTools - Debugging

📁 Project Structure
text
shopshere-ecommerce/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── reviews.js
│   │   └── payment.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── reviews/
│   │   │   ├── payment/
│   │   │   └── admin/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   ├── public/
│   └── package.json
└── README.md
⚡ Installation & Setup
Prerequisites
Node.js (v18 or higher)

MongoDB (local or Atlas)

Stripe account

Backend Setup
bash
# Clone the repository
git clone https://github.com/yourusername/shopsphere-ecommerce.git
cd shopshere-ecommerce/backend

# Install dependencies
npm install

# Environment variables
cp .env.example .env
# Edit .env with your configurations

# Start development server
npm run dev
Frontend Setup
bash
cd ../frontend

# Install dependencies
npm install

# Environment variables
cp .env.example .env
# Edit .env with your configurations

# Start development server
npm run dev
Environment Variables
Backend (.env)

env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shopsphere
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
CLIENT_URL=http://localhost:5173
Frontend (.env)

env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
📚 API Documentation
Authentication Endpoints
POST /api/auth/register - User registration

POST /api/auth/login - User login

GET /api/auth/me - Get current user

Product Endpoints
GET /api/products - Get all products

GET /api/products/:id - Get single product

POST /api/products - Create product (Admin)

PUT /api/products/:id - Update product (Admin)

Order Endpoints
POST /api/orders - Create order

GET /api/orders/my-orders - Get user orders

GET /api/orders/:id - Get order details

Payment Endpoints
POST /api/payment/create-payment-intent - Create Stripe payment

POST /api/payment/webhook - Stripe webhook

🚀 Deployment
Frontend Deployment (Vercel)
Connect GitHub repository to Vercel

Set environment variables in Vercel dashboard

Automatic deployment on git push

Backend Deployment (Railway)
Connect GitHub repository to Railway

Set environment variables

Automatic deployment on git push

Database (MongoDB Atlas)
Create free cluster on MongoDB Atlas

Get connection string

Update MONGODB_URI in production environment

🧪 Testing
Backend Testing
bash
cd backend
npm test
Frontend Testing
bash
cd frontend
npm test
Test Coverage
Unit tests for critical components

Integration tests for API endpoints

End-to-end tests for user flows


Key Features Demonstrated
User Registration & Authentication

Product Browsing & Search

Shopping Cart Management

Checkout & Payment Processing

Admin Dashboard Operations

Responsive Design

Technical Decisions Highlighted
State Management: Context API for global state

Authentication: JWT with secure storage

Payment Integration: Stripe with webhooks

Database Design: Optimized MongoDB schemas

Security: Input validation and sanitization

👥 Development Process
Week 1: Planning & Design
Project ideation and requirement analysis

Database schema design

API endpoint planning

Wireframe creation

Week 2-3: Backend Development
Express server setup

MongoDB models and relationships

Authentication system

Core API endpoints

Week 4: Frontend Development
React application setup

Component architecture

State management

UI/UX implementation

Week 5: Advanced Features
Payment integration

Real-time features

Admin dashboard

Testing and optimization

Week 6: Deployment & Polish
Production deployment

Performance optimization

Documentation

Presentation preparation

🏆 Learning Outcomes
Technical Skills
Full-stack MERN application development

RESTful API design and implementation

Database design with MongoDB

Payment gateway integration

Authentication and authorization

Deployment and DevOps

Professional Skills
Project planning and management

Problem-solving and debugging

Code organization and documentation

Team collaboration

Presentation skills

🔮 Future Enhancements
Mobile app development

Advanced analytics dashboard

Multi-vendor support

Internationalization

Advanced search with AI

Social media integration

Email marketing automation

Inventory forecasting

📞 Support
For questions or support regarding this project:

Email: mukamiglory93@gmail.com

GitHub Issues: Project Issues

📄 License
This project is licensed under the MIT License - see the LICENSE.md file for details.

🙏 Acknowledgments
Course instructors and teaching assistants

MongoDB University for database resources

Stripe documentation team

React and Node.js communities

Tailwind CSS for excellent documentation

Built with ❤️ for the MERN Stack Capstone Project

