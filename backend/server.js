const express = require('express');
const cors = require('cors');
// ⭐️ CRITICAL FIX: Require dotenv and call config() immediately ⭐️
const dotenv = require('dotenv');
dotenv.config();
// ⭐️ NOW it's safe to load other modules that read process.env ⭐️

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const startNightlyArchiveJob = require('./scheduler'); 

// Connect to database (Uses process.env.MONGO_URI, which is now loaded)
connectDB();

const app = express();

// ... (Rest of your middleware and routing logic remains the same) ...

// CORS configuration - allow your frontend origin
app.use(cors({
// ...
}));

// Manual CORS headers as fallback
app.use((req, res, next) => {
// ...
  next();
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Basic route for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Server Error' });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // START THE CRON JOB HERE
  startNightlyArchiveJob();
});