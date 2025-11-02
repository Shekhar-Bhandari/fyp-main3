// File: scheduler.js
const cron = require('node-cron');
const Post = require('./models/Post'); // Adjust the path if needed

// The cron string '0 0 * * *' means: 0 minutes, 0 hours (midnight), every day
const startNightlyArchiveJob = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log(`--- Running nightly post archive job at ${new Date().toISOString()} ---`);
    
    try {
      // Find all posts that are currently active (isArchived: false) 
      // and set their status to archived (isArchived: true).
      const result = await Post.updateMany(
          { isArchived: false }, 
          { $set: { isArchived: true } }
      );
      
      console.log(`Successfully archived ${result.modifiedCount} posts from yesterday.`);
    } catch (error) {
      console.error('CRON ERROR: Failed to archive posts:', error);
    }
  }, {
    scheduled: true,
    // ⚠️ IMPORTANT: Set your server's correct timezone for accurate midnight resets.
    timezone: "Asia/Kolkata" 
  });

  console.log('Nightly post archive job successfully scheduled.');
};

module.exports = startNightlyArchiveJob;