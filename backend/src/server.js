import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import './config/firebase.js'; // Initialize Firebase




// 1. IMPORT YOUR ROUTER
// Make sure this path points to the file where you defined router.post('/sync'...)
import apiRoutes from './routes/api.js';

dotenv.config();

console.log("Current Directory:", process.cwd());
console.log("Variables Loaded:", process.env.MONGODB_URI ? "YES" : "NO");
const app = express();

// 2. MIDDLEWARE
app.use(cors());
app.use(express.json()); // Essential for reading your AI logs

// LOGGING MIDDLEWARE
app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.path}`);
    next();
});

// Global Error Handler for JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON:', err.message);
    return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
  }
  next();
});

// 3. ATTACH THE ROUTER
app.use('/api', apiRoutes);

// 4. THE STAY-ALIVE LOGIC
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(" Azuka Database Connected");
    
    // This line is what stops the "Clean Exit"
    app.listen(PORT, '0.0.0.0', () => {
      console.log(` Azuka is ONLINE at http://0.0.0.0:${PORT}`);
    });
  })
  .catch(err => {
    console.error("Connection failed:", err.message);
  });

// Global Error Handler (Catch-all)
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(500).json({ 
    success: false, 
    message: "Internal Server Error", 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});