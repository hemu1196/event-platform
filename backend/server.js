import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://event-platform-theta-ruby.vercel.app",
  "https://event-hub-eight-tau.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, postman, curl)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed domains or is a Vercel preview URL/local port
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith('.vercel.app') || 
                      /^http:\/\/localhost:\d+$/.test(origin);
                      
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Base Health Check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Event Registration & Ticketing Platform API is running smoothly.',
    timestamp: new Date()
  });
});

// Routes Configuration
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);

// 404 Fallback Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: [${req.method}] ${req.originalUrl}`
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('SERVER EXCEPTION:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 EVENT PLATFORM SERVER IS LIVE ON PORT: ${PORT}`);
  console.log(`📂 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Endpoint: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
