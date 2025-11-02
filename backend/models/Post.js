const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  // Updated media field to store both images and videos
  media: {
    url: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: ['image', 'video', 'none'],
      default: 'none'
    },
    publicId: {
      type: String,
      default: ''
    }
  },
  // Keep for backward compatibility
  image: {
    type: String,
    default: ''
  },
  specialization: {
    type: String,
    required: true
  },
  isArchived: {
    type: Boolean,
    default: false 
  },
  likes: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      likedAt: { type: Date, default: Date.now },
    },
  ],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true
    },
    name: {
      type: String
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // ⭐️ START: NEW FIELDS FOR SEASONAL LEADERBOARD ⭐️
  
  // 1. Seasonal Ranking Stats: Scores used ONLY for the current leaderboard calculation.
  rankingStats: {
    likesCount: { 
      type: Number, 
      default: 0 
    },
    commentsCount: { 
      type: Number, 
      default: 0 
    },
  },
  
  // 2. Reset Timestamp: Tracks when the rankingStats were last zeroed out.
  rankingResetAt: {
    type: Date,
    default: Date.now, // Defaults to creation time initially
  }
  
  // ⭐️ END: NEW FIELDS FOR SEASONAL LEADERBOARD ⭐️
  
}, {
  timestamps: true // Keeps createdAt and updatedAt
});

module.exports = mongoose.model('Post', PostSchema);