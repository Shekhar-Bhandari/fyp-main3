// cleanupLikes.js - Run this script once to clean up corrupted like data
// Place this file in your backend root directory and run: node cleanupLikes.js

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ MongoDB Connected');
  } catch (error) {
    console.error('✗ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Define Post Schema (simplified)
const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String,
  likes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    likedAt: { type: Date, default: Date.now },
  }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Post = mongoose.model('Post', PostSchema);

// Cleanup function
const cleanupLikes = async () => {
  try {
    console.log('\n=== Starting Likes Cleanup ===\n');

    // Find all posts
    const posts = await Post.find({});
    console.log(`Found ${posts.length} posts to check`);

    let totalCleaned = 0;
    let postsModified = 0;

    for (const post of posts) {
      const originalLikesCount = post.likes.length;
      
      // Filter out null/undefined user references
      const validLikes = post.likes.filter(like => {
        if (!like || !like.user) {
          console.log(`  ⚠ Found invalid like in post ${post._id}`);
          return false;
        }
        return true;
      });

      // Remove duplicate likes from the same user
      const uniqueLikes = [];
      const seenUsers = new Set();

      for (const like of validLikes) {
        const userId = like.user.toString();
        if (!seenUsers.has(userId)) {
          seenUsers.add(userId);
          uniqueLikes.push(like);
        } else {
          console.log(`  ⚠ Found duplicate like from user ${userId} in post ${post._id}`);
        }
      }

      const cleaned = originalLikesCount - uniqueLikes.length;

      if (cleaned > 0) {
        post.likes = uniqueLikes;
        await post.save();
        totalCleaned += cleaned;
        postsModified++;
        console.log(`  ✓ Cleaned ${cleaned} invalid/duplicate like(s) from post ${post._id}`);
      }
    }

    console.log('\n=== Cleanup Complete ===');
    console.log(`Posts checked: ${posts.length}`);
    console.log(`Posts modified: ${postsModified}`);
    console.log(`Total likes cleaned: ${totalCleaned}`);
    console.log('\nYour database is now clean! ✨\n');

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the cleanup
const run = async () => {
  await connectDB();
  await cleanupLikes();
};

run();