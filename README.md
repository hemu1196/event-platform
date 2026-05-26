# EventFlow: Event Registration & Ticketing Platform

An ultra-modern, professional, full-stack **Event Registration & Ticketing Platform** designed as a major college capstone project. 

This repository features a **Vite React + Tailwind CSS + Framer Motion** frontend and a modular **Node.js + Express.js** backend, communicating with a secure **Supabase PostgreSQL** database. It integrates sandboxed **Razorpay Payments** and dynamic **Client-Side QR Code Tickets** with a real-time **Organizer Verification Scanner**.

---

## 📂 Project Structure

```text
event-platform/
├── backend/
│   ├── config/
│   │   └── db.js            # Supabase database client initialization
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── paymentController.js
│   │   ├── ticketController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── authMiddleware.js # JWT validation & role restriction
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── ticketRoutes.js
│   │   └── adminRoutes.js
│   ├── server.js            # Main Express server entry point
│   └── .env                 # Environment variables
└── frontend/
    ├── src/
    │   ├── components/      # Common UI (Navbar, Route Guards)
    │   ├── context/         # AuthSession & custom Toast Contexts
    │   ├── pages/           # Landing, Dashboards, QR Ticket, Checkout Success
    │   ├── utils/           # Axios central API client
    │   ├── App.jsx          # Route trees & permission controls
    │   └── index.css        # Tailwind directives & Custom glass designs
    ├── tailwind.config.js   # Custom dark SaaS theme tokens
    └── package.json
```

---

## ⚡ Supabase SQL Setup Schema

Follow these steps to configure your PostgreSQL database instantly:
1. Create a free account at [Supabase](https://supabase.com/).
2. Initialize a new project named `EventFlow`.
3. Open the **SQL Editor** in the Supabase Sidebar.
4. Copy, paste, and run the following script to establish the schemas, constraints, and relationships:

```sql
-- 1. Create Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'organizer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create Events Table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(50) NOT NULL,
  venue VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  capacity INT NOT NULL,
  tickets_sold INT DEFAULT 0 NOT NULL,
  image_url TEXT NOT NULL,
  organizer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Registrations Table
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  ticket_count INT DEFAULT 1 NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create Payments Table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE NOT NULL,
  razorpay_order_id VARCHAR(255) UNIQUE NOT NULL,
  razorpay_payment_id VARCHAR(255) UNIQUE,
  razorpay_signature VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Create Tickets Table
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  ticket_code VARCHAR(255) UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

---

## ⚙️ Environment Variables

### Backend Configuration
Inside `backend/.env`, define the following variables:
```env
PORT=5001
NODE_ENV=development
JWT_SECRET=supersecretcollegecapstone123

# Supabase Configurations
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Razorpay Keys (Leave empty to enable fully functional simulated Demo Checkout Mode!)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

## 🚀 Execution & Setup Guide

### 1. Initialize the Backend Server
```bash
cd backend
npm install
npm run dev
```
The server will boot up locally at `http://localhost:5001`.

### 2. Initialize the Frontend App
```bash
cd frontend
npm install
npm run dev
```
Vite will serve the client locally at `http://localhost:5173` (or similar active port). Open this address in your web browser.

---

## 🎓 Capstone Viva Defense Guide (Oral Prep)

During project evaluations, external examiners typically ask targeted technical questions. Here are the core questions and the ideal technical answers you should deliver:

### Q1: Why did you choose Supabase over standard MySQL or local MongoDB?
* **Answer**: *"We selected Supabase because it exposes a standard PostgreSQL database engine. Unlike traditional SQL setups, Supabase utilizes HTTP connection layers and handles connection pools natively on the server. This prevents connection dropouts on free hosting tiers like Render, and its Javascript SDK allows us to execute relational selects with simple dot chains (like `.select('*, event:event_id(*)')`) instead of long, verbose SQL boilerplate, keeping our code clean and easy to maintain."*

### Q2: How is user identity secured?
* **Answer**: *"We built a custom JSON Web Token (JWT) authorization flow. When a user registers or logs in, their password is encrypted using `bcryptjs` with a computational salt of 10. If matching, the Express server signs a unique cryptographic JWT token encoding their unique ID, name, and role. The token is stored in the client's `localStorage` and sent inside the HTTP `Authorization: Bearer <token>` header for any subsequent request. Our Express `authMiddleware` intercepts, parses, and validates the signature on every protected API endpoint."*

### Q3: How is Razorpay integrated and verified safely?
* **Answer**: *"To prevent malicious client-side ticket tampering, we implement a two-step payment verification loop:
  1. The student selects a ticket quantity, and our backend verifies the event capacity. If valid, the backend creates a `pending` registration entry in our database and calls the Razorpay SDK to create an official order receipt.
  2. The frontend loads the Razorpay checkout screen. Upon payment, Razorpay returns an `order_id`, `payment_id`, and a cryptographic `signature`.
  3. The frontend passes these parameters to our backend. The backend uses the Node.js built-in `crypto` library to compute an **HMAC-SHA256 hash** of the order and payment ID using our private `RAZORPAY_KEY_SECRET`. If the calculated hash matches the signature returned by Razorpay, the ticket booking is marked completed, and the capacity count decreases. If the keys are missing during college testing, our server enters a mock **Simulated Demo Mode** that mimics this entire verification flow flawlessly."*

### Q4: How is the QR Code validated, and how do you prevent duplicate entry?
* **Answer**: *"When a payment is verified, the server generates a unique ticket entry containing a custom string (`TKT-IND-XXXX`). When the student views their ticket, the React frontend uses the `qrcode.react` client library to render this code as a highly customizable SVG QR code instantly on their screen.
  Organizers can paste or scan this code inside their Organizer Dashboard. Our backend queries the `tickets` table by code. If `is_used` is already `true`, it flags a warning showing the original scan timestamp to prevent double-entry. Otherwise, it updates `is_used` to `true`, verifying admission instantly."*
