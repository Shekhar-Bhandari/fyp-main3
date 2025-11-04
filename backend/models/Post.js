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
  
  // ⭐️ START: ADDED/UPDATED FIELDS ⭐️
  
  // 1. Persistent Views Array: Stores user IDs to track who has viewed the post 
  // and prevent duplicate counts from the same user.
  views: [
    {
      user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
      },
      viewedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  
  // 2. Seasonal Ranking Stats: Updated to include viewsCount for the leaderboard algorithm.
  rankingStats: {
    likesCount: { 
      type: Number, 
      default: 0 
    },
    commentsCount: { 
      type: Number, 
      default: 0 
    },
    // NEW: Include view count for the seasonal ranking score
    viewsCount: { 
      type: Number, 
      default: 0 
    },
  },
  
  // 3. Reset Timestamp: Tracks when the rankingStats were last zeroed out.
  rankingResetAt: {
    type: Date,
    default: Date.now,
  }
  
  // ⭐️ END: ADDED/UPDATED FIELDS ⭐️
  
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', PostSchema);