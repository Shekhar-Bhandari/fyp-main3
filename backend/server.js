const express = require('express');
const cors = require('cors');
// ⭐️ CRITICAL FIX: Require dotenv and call config() immediately ⭐️
const dotenv = require('dotenv');
dotenv.config();
// ⭐️ NOW it's safe to load other modules that read process.env ⭐️

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts'); // All post-related routes (including /:id/view)
const startNightlyArchiveJob = require('./scheduler'); 

// --- Database Connection ---
// Connect to database (Uses process.env.MONGO_URI, which is now loaded)
connectDB();

const app = express();

// --- Middleware Configuration ---

// CORS configuration - allow your frontend origin
// Set origin dynamically using environment variables
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000']; 

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
}));

// Body parsing middleware for JSON and URL-encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- Routes ---

// Basic route for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.use('/api/auth', authRoutes);
// All post routes (including POST/PUT /:postId/view) are handled here
app.use('/api/posts', postRoutes); 

// --- Error Handling and Server Start ---

// Error handling middleware (must be the last middleware)
// NOTE: If you don't have './middleware/errorMiddleware', replace this with the inline function below.

/* // If you don't use a separate file, use this inline error handler:
app.use((error, req, res, next) => {
  console.error(error.stack); 
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.status || 500).json({ 
    message: error.message || 'Server Error',
    success: false,
  });
});
*/

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // START THE CRON JOB HERE
  startNightlyArchiveJob();
});