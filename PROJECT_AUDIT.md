# Project Audit - BKW Marketplace

## 1. Project Overview & Architecture
The project is a MERN stack e-commerce marketplace (MongoDB, Express, React, Node.js) with additional Firebase integration and AI image classification capabilities.
* **Backend:** Express API serving JSON endpoints, connected to MongoDB (Mongoose), using JWT for authentication. Uses `db.json` and mock mode in some scenarios.
* **Frontend:** React 19 application bundled with Vite. Styled with Tailwind CSS, utilizing Framer Motion for animations and Zustand/Context API for state management. Uses `react-router-dom` for navigation with lazy-loaded components.

## 2. Features
1. **Authentication:** Registration, login, password reset, and JWT/Firebase session management.
2. **Product Marketplace:** Homepage, product listings by category, detailed product views, and a shopping cart.
3. **Seller Dashboard:** Sellers can manage products, upload items (with images via Firebase Storage).
4. **AI Capabilities:** `@tensorflow-models/mobilenet` is included for in-browser image classification.
5. **Video Streaming:** Uses HLS (`hls.js`) for rendering video streams.
6. **Chatbot Interface:** Includes a `ChatbotLauncher` component.

## 3. Bugs & Technical Debt
* **Extensive Linting Errors:** A `lint_output.txt` (~41KB) exists in the frontend, indicating many ESLint errors and warnings across the codebase that need immediate resolution.
* **Hardcoded Debug Paths:** `backend/controllers/productController.js` logs to an external directory path (`../../../debug-509474.log`), which will fail in production and cause crashes.
* **Mock Database usage:** The backend appears to have a mock fallback (`db.json` and `ALLOW_MOCK_DB=true`), which might introduce inconsistencies if not properly decoupled from MongoDB logic.
* **Error Logs:** `preview.err.log` and `vite-theme.err.log` are present in the frontend root, signaling past build/execution issues.
* **Code Smells:** Some global console logs and unused imports across components.

## 4. Security Concerns
* **Environment Variables:** `JWT_SECRET` checking logic exists, but Firebase credentials and other keys are placed in `.env.example` templates which could be misconfigured in production.
* **Helmet Configuration:** `backend/server.js` implements `helmet`, but Trusted Types and strict Content Security Policies might block some legitimate scripts (like Firebase Auth or TensorFlow loading) if not configured correctly for production.
* **Rate Limiting & CORS:** CORS is properly configured to `ALLOWED_ORIGINS`, and a `generalLimiter` is applied globally.
* **Error Handling:** Backend explicitly attempts to avoid stack trace leaks, but deep testing is needed to ensure validation errors (like Mongoose duplicates) do not leak sensitive table/schema details.

## 5. Performance Bottlenecks
* **Large Bundles:** Including `@tensorflow/tfjs` and `@tensorflow-models/mobilenet` synchronously or eagerly will severely bloat the initial Javascript bundle size and delay Time to Interactive (TTI).
* **Missing Lazy Loading for Heavy Components:** While routes are lazy-loaded, the TensorFlow model initialization must be strictly deferred. 
* **Database Queries:** Depending on the implementation in `productRoutes.js`, missing indexes on MongoDB could slow down product search and filtering as the database grows.
* **Images:** Image delivery via Firebase Storage should be optimized or compressed before uploading.

---
**Status:** Audit complete. Moving to Phase 2: Fix Build & Lint Issues.
