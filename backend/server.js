const express = require('express');
const cors = require('cors');
// ⭐️ CRITICAL FIX: Require dotenv and call config() immediately ⭐️
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts'); 
const startNightlyArchiveJob = require('./scheduler'); 

// --- Database Connection ---
connectDB();

const app = express();

// --- Middleware Configuration ---
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000']; 

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- Routes ---

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// 🚨 FIX: Change the mounting point to /api/users to match frontend calls.
app.use('/api/users', authRoutes); // <--- THIS WAS THE 404 CAUSE

app.use('/api/posts', postRoutes); 

// --- Error Handling and Server Start ---

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // START THE CRON JOB HERE
  startNightlyArchiveJob();
});