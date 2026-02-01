import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';




// 1. IMPORT YOUR ROUTER
// Make sure this path points to the file where you defined router.post('/sync'...)
import apiRoutes from './routes/api.js';

dotenv.config();

console.log("--- KEY DEBUG ---");
console.log("Key Length:", process.env.GEMINI_API_KEY?.length);
console.log("Starts with AIza:", process.env.GEMINI_API_KEY?.startsWith("AIza"));
console.log("Ends with quote:", process.env.GEMINI_API_KEY?.endsWith('"'));
console.log("-----------------");

console.log("Current Directory:", process.cwd());
console.log("Variables Loaded:", process.env.MONGODB_URI ? "YES" : "NO");
const app = express();

// 2. MIDDLEWARE
app.use(cors());
app.use(express.json()); // Essential for reading your AI logs

// 3. ATTACH THE ROUTER
app.use('/api', apiRoutes);

// 4. THE STAY-ALIVE LOGIC
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(" Azuka Database Connected");
    
    // This line is what stops the "Clean Exit"
    app.listen(PORT, () => {
      console.log(` Azuka is ONLINE at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("Connection failed:", err.message);
  });