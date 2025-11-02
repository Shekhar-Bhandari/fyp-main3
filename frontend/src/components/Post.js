import React, { useState } from 'react';
import {
  Card, CardHeader, CardMedia, CardContent, CardActions,
  Avatar, IconButton, Typography, Menu, MenuItem, Box, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import {
  MoreVert, ThumbUp, Comment, Delete, Edit, Send, Close
} from '@mui/icons-material';
import moment from 'moment';
import { likePost, deletePost, updatePost, commentPost } from '../Services/api';

const Post = ({ post, onDelete, onUpdate }) => {
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    title: post.title,
    description: post.description,
    image: post.image || ''
  });
  const [loading, setLoading] = useState(false);
  
  const userInfo = JSON.parse(localStorage.getItem('profile'));
  const isOwner = userInfo && userInfo._id === post.user._id;

  const handleLike = async () => {
    if (!userInfo) {
      alert('Please login to like posts');
      return;
    }

    try {
      const { data } = await likePost(post._id);
      setLikes(data.likes || []);
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Error liking post');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      alert('Please login to comment');
      return;
    }

    if (!commentText.trim()) {
      alert('Comment cannot be empty');
      return;
    }

    try {
      const { data } = await commentPost(post._id, commentText);
      setComments(data.comments || []);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment');
    }
  };

  const handleDelete = async () => {
    if (!userInfo) {
      alert('Please login to delete posts');
      return;
    }

    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(post._id);
        if (onDelete) onDelete(post._id);
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post');
      }
    }
    setAnchorEl(null);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data } = await updatePost(post._id, editData);
      
      if (onUpdate && data.post) {
        onUpdate(data.post);
      }
      setEditDialogOpen(false);
      alert('Post updated successfully');
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Error updating post');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const openEditDialog = () => {
    setEditData({
      title: post.title,
      description: post.description,
      image: post.image || ''
    });
    setEditDialogOpen(true);
    setAnchorEl(null);
  };

  const isLiked = userInfo && likes.some(like => like.user && like.user._id === userInfo._id);

  // Function to detect and render links in post description
  const renderTextWithLinks = (text) => {
    if (!text) return '';
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1976d2', textDecoration: 'underline' }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <>
      <Card sx={{ marginBottom: 3 }}>
        <CardHeader
          avatar={
            <Avatar src={post.user?.profileImage}>
              {post.user?.name?.charAt(0) || 'U'}
            </Avatar>
          }
          action={
            isOwner && (
              <>
                <IconButton onClick={handleMenuOpen}>
                  <MoreVert />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={openEditDialog}>
                    <Edit sx={{ marginRight: 1 }} /> Edit
                  </MenuItem>
                  <MenuItem onClick={handleDelete}>
                    <Delete sx={{ marginRight: 1 }} /> Delete
                  </MenuItem>
                </Menu>
              </>
            )
          }
          title={post.user?.name || 'Unknown User'}
          subheader={moment(post.createdAt).fromNow()}
        />
        
        {post.image && (
          <CardMedia
            component="img"
            height="300"
            image={post.image}
            alt={post.title}
            sx={{ objectFit: 'cover' }}
          />
        )}
        
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {post.title}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="div">
            {renderTextWithLinks(post.description)}
          </Typography>
        </CardContent>
        
        <CardActions disableSpacing>
          <IconButton onClick={handleLike} disabled={!userInfo}>
            <ThumbUp color={isLiked ? 'primary' : 'inherit'} />
          </IconButton>
          <Typography variant="body2">
            {likes.length} {likes.length === 1 ? 'Like' : 'Likes'}
          </Typography>
          
          <IconButton>
            <Comment />
          </IconButton>
          <Typography variant="body2">
            {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </Typography>
        </CardActions>

        <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
          <form onSubmit={handleComment} style={{ display: 'flex', gap: '8px' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!userInfo}
            />
            <Button 
              type="submit" 
              variant="contained" 
              size="small"
              disabled={!userInfo || !commentText.trim()}
            >
              <Send />
            </Button>
          </form>
        </Box>
      </Card>

      {/* Edit Post Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Edit Post
          <IconButton
            aria-label="close"
            onClick={() => setEditDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleEdit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              variant="outlined"
              value={editData.title}
              onChange={(e) => setEditData({...editData, title: e.target.value})}
              required
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={editData.description}
              onChange={(e) => setEditData({...editData, description: e.target.value})}
              required
            />
            <TextField
              margin="dense"
              label="Image URL (optional)"
              fullWidth
              variant="outlined"
              value={editData.image}
              onChange={(e) => setEditData({...editData, image: e.target.value})}
            />
            {editData.image && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Image Preview:
                </Typography>
                <img 
                  src={editData.image} 
                  alt="Preview" 
                  style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '8px' }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Updating...' : 'Update Post'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default Post;