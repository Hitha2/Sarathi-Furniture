# Sarathi Furniture

Sarathi Furniture is a full-stack e-commerce web application developed using the MERN stack (MongoDB, Express.js, React.js, and Node.js). The application provides a seamless online shopping experience for furniture products, featuring secure authentication, product browsing, shopping cart management, wishlist functionality, online payments, and an administrative dashboard for managing products and customer orders.

## Overview

The project demonstrates the implementation of a scalable e-commerce platform following modern web development practices. It includes role-based access control, RESTful APIs, secure payment integration, responsive user interfaces, and efficient state management.

## Live Demo

**Application:** https://sarathi-furniture.vercel.app/

## Features

- Secure user authentication using JWT
- Role-based authorization for users and administrators
- Product catalog with category-based filtering
- Product search functionality
- Shopping cart and wishlist management
- Secure checkout with Razorpay integration
- Order placement and order history
- User profile management
- Admin dashboard
- Product management
- Order management
- Responsive design across devices

## Technology Stack

| Layer | Technologies |
|--------|--------------|
| Frontend | React.js, React Router, Tailwind CSS, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt.js |
| Payment | Razorpay |
| Deployment | Vercel, Render |

## Architecture

```
React.js
     │
     ▼
REST API (Express.js)
     │
     ▼
MongoDB Database
```

## Project Structure

```
Sarathi-Furniture
│
├── Admin
├── User
├── backend
├── Images
└── README.md
```

## Installation

Clone the repository

```bash
git clone https://github.com/Hitha2/Sarathi-Furniture.git
```

Install backend dependencies

```bash
cd backend
npm install
```

Install frontend dependencies

```bash
cd frontend
npm install
```

Configure environment variables.

Backend

```env
PORT=
MONGO_URI=
JWT_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

Frontend

```env
VITE_API_URL=
VITE_RAZORPAY_KEY_ID=
```

Run the application

Backend

```bash
npm run server
```

Frontend

```bash
npm run dev
```

## Future Improvements

- Coupon and discount management
- Email notifications
- Real-time order tracking
- Recommendation system

## Author

**Hithaishi Kulal**

- GitHub: https://github.com/Hitha2
- LinkedIn: https://linkedin.com/in/hithaishi-kulal

## License

This project is licensed under the MIT License.
