# GoldMarket: AI-Powered MERN Marketplace

GoldMarket is a full-stack, production-ready e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js). It features a robust multi-role architecture (Customers, Sellers, Admins) and integrates Google Gemini AI to provide a highly interactive shopping assistant.

## ✨ Features

### 🛒 E-Commerce Core
- **Marketplace Browsing**: Browse categories, search products, filter by price/rating.
- **Persistent Cart**: Shopping cart automatically synchronizes with the MongoDB backend.
- **Seller Dashboard**: Dedicated UI for sellers to upload products with client-side image compression.
- **Wishlist & Saved Items**: Save items for later.

### 🤖 AI Shopping Assistant (Gemini)
- **Conversational Search**: Chat with an integrated bot to find exactly what you're looking for.
- **Visual Search**: Upload images to the chatbot to find visually similar products (powered by Gemini's multimodal vision model).
- **Graceful Fallbacks**: In-memory mapping cache and rate limiting to prevent API exhaustion.

### 🛡️ Enterprise-Grade Security
- **Strict Headers**: Configured with `helmet` for CSP, DOM-based XSS prevention (Trusted Types), HSTS, and Frameguard.
- **Rate Limiting**: Dedicated rate limiters for Auth routes, Product uploading, and global API traffic.
- **CORS Constraints**: Fully isolated to `ALLOWED_ORIGINS` via environment configuration.
- **Sanitized Errors**: Error handling strictly masks internal 500 stacks while passing safe 400/409 validation details to the client.

### ⚡ Performance Optimizations
- **Lazy Loading**: Heavy video/HLS logic and route-level code splitting ensures a rapid Time-to-Interactive (TTI).
- **Client-Side Image Compression**: Seller image uploads are resized and compressed into efficient JPEG blobs before hitting Firebase Storage.
- **MongoDB Indexing**: Compound indexing and text indexes on the `Product` schema optimize heavy concurrent queries.

---

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Zustand
- **Backend**: Node.js, Express, Mongoose (MongoDB)
- **AI**: `@google/generative-ai` (Gemini 1.5 Flash)
- **Authentication**: JWT & Firebase Auth (for social providers)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas URI

### 2. Backend Setup
```bash
cd backend
npm install

# Copy .env.example and populate your keys
cp .env.example .env

# Start the server
npm run dev
```
*(Make sure you provide `JWT_SECRET`, `MONGO_URI`, and `GEMINI_API_KEY` in your `.env`)*

### 3. Frontend Setup
```bash
cd frontend
npm install

# Copy .env.example
cp .env.example .env

# Start the dev server
npm run dev
```

---

## 📚 Project Structure

```text
/backend
  /controllers     # Business logic (AI, Auth, Cart, Products)
  /models          # Mongoose Schemas
  /middleware      # JWT auth, rate limiting, validation
  /routes          # Express endpoints

/frontend
  /src
    /components    # Reusable UI (CartItems, Navbar, AI Chatbot)
    /pages         # Route views (Home, Upload, Login)
    /services      # API Axios wrappers and Firebase config
    /utils         # Image compression, formatting
```

---

*This repository was successfully audited, refactored, and finalized into a production-ready state.*
