const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const { protect } = require('../middleware/auth'); // Assuming protect middleware is in '../middleware/auth'

// Initialize upload and cloudinary variables
let upload, cloudinary;

// Attempt to import Cloudinary/Multer setup
try {
  const cloudinaryModule = require('../config/cloudinary');
  upload = cloudinaryModule.upload;
  cloudinary = cloudinaryModule.cloudinary;
} catch (error) {
  console.error('✗ CRITICAL: Failed to load Cloudinary/Multer module in posts.js:', error.message); 
}

// ---------------- CREATE POST WITH FILE UPLOAD ----------------
router.post('/', protect, (req, res, next) => {
  if (upload) {
    upload.single('mediaFile')(req, res, (error) => {
        if (error) {
            console.error("Multer/Cloudinary Upload Error:", error.message);
            return next(error); 
        }
        next();
    }); 
  } else {
    console.warn('Warning: Post creation proceeding without file upload middleware (upload is undefined).');
    next(); 
  }
}, async (req, res) => {
  try {
    console.log('=== POST CREATE REQUEST START ===');
    
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Authenticated user not found.' });
    }
    
    // NOTE: Assuming user.canCreatePost() and user.incrementPostCount() methods exist
    if (!user.canCreatePost()) {
        await user.save();
        return res.status(403).json({ message: 'You have reached the weekly post limit (5 posts).' });
    }
    
    const { title, description, specialization } = req.body;

    if (!title || !description || !specialization) {
      return res.status(400).json({ message: 'Title, description, and specialization are required' });
    }

    const mediaData = {
      url: '', type: 'none', publicId: ''
    };

    if (req.file) {
      mediaData.url = req.file.path;
      mediaData.publicId = req.file.filename;
      mediaData.type = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    }

    const post = await Post.create({
      user: req.user._id,
      title: title.trim(),
      description: description.trim(),
      media: mediaData,
      image: mediaData.url,
      specialization,
      isArchived: false
    });

    await user.incrementPostCount();

    const populatedPost = await Post.findById(post._id).populate('user', 'name profileImage');

    console.log('Post created successfully:', populatedPost._id);
    console.log('=== POST CREATE REQUEST END ===');
    res.status(201).json({
      message: 'Post created successfully',
      post: populatedPost
    });
  } catch (error) {
    console.error('=== ERROR CREATING POST (Async Block) ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation failed: A required field for the post is missing or invalid.' });
    }
    
    res.status(500).json({ message: error.message || 'Server Error during post creation.' });
  }
});

// ---------------- RECORD POST VIEW (NEW ROUTE) ----------------
/**
 * @desc    Records a view for a post, increments seasonal viewsCount.
 * @route   PUT /api/posts/:id/view (Using PUT to reflect an update/change to the resource)
 * @access  Private 
 */
router.put('/:id/view', protect, async (req, res) => {
    try {
        const postId = req.params.id;
        // User must be authenticated to record a view (set by protect middleware)
        const userId = req.user._id; 

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // 1. Check if the user has already viewed the post
        const hasViewed = post.views.some(
            // Compare Mongoose ObjectIds as strings
            (view) => view.user && view.user.toString() === userId.toString()
        );

        let updatedPost;

        if (hasViewed) {
            // Already viewed: Do nothing to the views array/count
            updatedPost = post;
        } else {
            // Not viewed: Add user ID to persistent views array
            post.views.push({ user: userId, viewedAt: new Date() });
            
            // Increment the seasonal viewsCount for the leaderboard
            if (post.rankingStats) {
                post.rankingStats.viewsCount = (post.rankingStats.viewsCount || 0) + 1;
            }

            updatedPost = await post.save();
        }
        
        // 2. Populate and return the post data
        const populatedPost = await Post.findById(updatedPost._id)
            .populate('user', 'name profileImage')
            .populate('likes.user', 'name email')
            .populate('comments.user', 'name profileImage');

        res.status(200).json(populatedPost);

    } catch (error) {
        console.error('Error recording post view:', error.message);
        res.status(500).json({ message: 'Failed to record view: ' + error.message });
    }
});
// ---------------- END RECORD POST VIEW ----------------

// ---------------- GET ALL POSTS (HOME FEED - WITH DECAY SYSTEM) ----------------
router.get('/', async (req, res) => {
  try {
    const { specialization } = req.query; 
    
    let query = { isArchived: false }; 
    
    if (specialization) {
      query.specialization = specialization;
    }

    const posts = await Post.find(query) 
      .populate('user', 'name profileImage') 
      .populate('likes.user', 'name email')
      .populate('comments.user', 'name profileImage'); 
    
    const postsWithScore = posts.map(post => {
      const now = new Date();
      const ageInHours = (now - post.createdAt) / (1000 * 60 * 60) + 0.1; 
      const likes = post.likes.length;
      const comments = post.comments.length;
      // NOTE: You can also incorporate post.views.length or post.rankingStats.viewsCount here
      // For now, keeping the original rank formula:
      const rankScore = (likes + (comments * 2)) / ageInHours; 
      
      return { 
        ...post.toObject(), 
        rankScore: rankScore
      };
    });

    postsWithScore.sort((a, b) => b.rankScore - a.rankScore);

    const finalPosts = postsWithScore.map(p => {
      const { rankScore, ...rest } = p;
      return rest;
    });

    res.json(finalPosts);

  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// ---------------- GET MY POSTS ----------------
router.get('/my-posts', protect, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id })
      .populate('user', 'name profileImage')
      .populate('likes.user', 'name email')
      .populate('comments.user', 'name email')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user posts' });
  }
});

// ---------------- UPDATE POST ----------------
router.put('/:id', protect, (req, res, next) => {
  if (upload) {
    upload.single('mediaFile')(req, res, next);
  } else {
    next();
  }
}, async (req, res) => {
  try {
    const { title, description, specialization, removeMedia } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    if ((req.file || removeMedia === 'true') && post.media?.publicId && cloudinary) {
      try {
        await cloudinary.uploader.destroy(post.media.publicId, {
          resource_type: post.media.type === 'video' ? 'video' : 'image'
        });
      } catch (err) {
        console.error('Error deleting old media:', err);
      }
    }

    post.title = title || post.title;
    post.description = description || post.description;
    post.specialization = specialization || post.specialization;

    if (req.file) {
      post.media = {
        url: req.file.path,
        publicId: req.file.filename,
        type: req.file.mimetype.startsWith('video/') ? 'video' : 'image'
      };
      post.image = req.file.path;
    } else if (removeMedia === 'true') {
      post.media = { url: '', type: 'none', publicId: '' };
      post.image = '';
    }

    const updatedPost = await post.save();
    const populated = await Post.findById(updatedPost._id).populate('user', 'name profileImage');

    res.json({ message: 'Post updated successfully', post: populated });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: error.message });
  }
});

// ---------------- DELETE POST ----------------
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    if (post.media?.publicId && cloudinary) {
      try {
        await cloudinary.uploader.destroy(post.media.publicId, {
          resource_type: post.media.type === 'video' ? 'video' : 'image'
        });
      } catch (err) {
        console.error('Error deleting media:', err);
      }
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully', deletedPostId: req.params.id });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: error.message });
  }
});

// ---------------- LIKE / UNLIKE POST (FIXED) ----------------
router.put('/:id/like', protect, async (req, res) => {
  try {
    console.log('=== LIKE/UNLIKE REQUEST START ===');
    console.log('Post ID:', req.params.id);
    console.log('User ID:', req.user._id);

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      console.log('Post not found');
      return res.status(404).json({ message: 'Post not found' });
    }

    console.log('Post found, current likes count:', post.likes.length);

    // CRITICAL FIX: Safely handle user ID comparison
    const userId = req.user._id.toString();
    
    // Clean up any null/undefined user references
    const validLikes = post.likes.filter(like => {
      if (!like || !like.user) {
        console.warn('Found invalid like entry (null user), removing...');
        return false;
      }
      return true;
    });

    // Check if user has already liked
    const likeIndex = validLikes.findIndex(like => {
      try {
        const likeUserId = like.user.toString();
        return likeUserId === userId;
      } catch (err) {
        console.error('Error comparing like user ID:', err);
        return false;
      }
    });

    const hasLiked = likeIndex !== -1;

    console.log('User has liked:', hasLiked);

    if (hasLiked) {
      // Unlike: Remove the user's like
      post.likes = validLikes.filter(like => {
        try {
          return like.user.toString() !== userId;
        } catch (err) {
          console.error('Error filtering likes:', err);
          return true;
        }
      });
      console.log('Post unliked, new count:', post.likes.length);
    } else {
      // Like: Add the user's like
      post.likes = validLikes;
      post.likes.push({ 
        user: req.user._id,
        likedAt: new Date()
      });
      console.log('Post liked, new count:', post.likes.length);
    }

    // Save the post
    await post.save();
    console.log('Post saved successfully');

    // Re-populate the post for the client response
    const updatedPost = await Post.findById(post._id)
      .populate('user', 'name profileImage')
      .populate('likes.user', 'name email')
      .populate('comments.user', 'name email')
      .populate('comments.user', 'name profileImage');

    console.log('Post populated, returning to client');
    console.log('=== LIKE/UNLIKE REQUEST END ===');

    res.json(updatedPost);
    
  } catch (error) {
    console.error('=== LIKE/UNLIKE ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Post ID:', req.params.id);
    console.error('User ID:', req.user?._id);
    
    res.status(500).json({ 
      message: error.message || 'Failed to like/unlike post',
      error: process.env.NODE_ENV === 'development' ? error.stack : 'Server Error'
    });
  }
});

// ---------------- ADD COMMENT ----------------
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body; 
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = {
      user: req.user._id, 
      text: text.trim()   
    };

    post.comments.push(comment);
    await post.save();
    
    // IMPORTANT: Also increment the seasonal commentsCount for the leaderboard
    if (post.rankingStats) {
        post.rankingStats.commentsCount = (post.rankingStats.commentsCount || 0) + 1;
    }
    
    await post.save(); // Save again if rankingStats was updated

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'name profileImage')
      .populate('likes.user', 'name email')
      .populate('comments.user', 'name profileImage'); 

    res.status(201).json(populatedPost); 

  } catch (error) {
    console.error('Error adding comment:', error.message); 
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed: Comment user or text field is missing/invalid.' });
    }

    res.status(500).json({ message: 'Failed to add comment: ' + error.message });
  }
});

module.exports = router;