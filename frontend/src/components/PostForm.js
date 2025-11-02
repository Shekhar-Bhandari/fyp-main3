import React, { useState, useEffect } from 'react';
import { 
  Paper, TextField, Button, Typography, Box, IconButton, Alert 
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { createPost } from '../Services/api';

const PostForm = ({ onPostCreated, editPost = null, onCancelEdit }) => {
  const [postData, setPostData] = useState({
    title: editPost?.title || '',
    description: editPost?.description || '',
    image: editPost?.image || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [postsRemaining, setPostsRemaining] = useState(null);
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem('profile'));

  // Check user's post limit
  useEffect(() => {
    const checkPostLimit = async () => {
      try {
        // You might want to create an API endpoint to get user's post count
        // For now, we'll handle this in the response
      } catch (error) {
        console.error('Error checking post limit:', error);
      }
    };

    if (user && !editPost) {
      checkPostLimit();
    }
  }, [user, editPost]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!postData.title.trim() || !postData.description.trim()) {
      setError('Title and description are required');
      setLoading(false);
      return;
    }

    try {
      const response = await createPost(postData);
      
      if (response.data) {
        setPostData({ title: '', description: '', image: '' });
        if (onPostCreated) onPostCreated(response.data.post);
        
        // Show posts remaining if available
        if (response.data.postsRemaining !== undefined) {
          setPostsRemaining(response.data.postsRemaining);
        }
      }
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.response?.status === 429) {
        setError(error.response.data.message);
      } else {
        setError(error.response?.data?.message || 'Failed to create post');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setPostData({ ...postData, [e.target.name]: e.target.value });
  };

  if (!user) {
    return (
      <Paper sx={{ padding: 2, marginBottom: 2 }}>
        <Typography variant="h6" align="center">
          Please sign in to create posts.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ padding: 2, marginBottom: 2, position: 'relative' }}>
      {editPost && (
        <IconButton
          sx={{ position: 'absolute', right: 8, top: 8 }}
          onClick={onCancelEdit}
          size="small"
        >
          <Close />
        </IconButton>
      )}
      
      <Typography variant="h6" gutterBottom>
        {editPost ? 'Edit Post' : 'Create a Post'}
      </Typography>

      {postsRemaining !== null && postsRemaining >= 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You have {postsRemaining} posts remaining this week.
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <TextField
          name="title"
          variant="outlined"
          label="Title"
          fullWidth
          value={postData.title}
          onChange={handleChange}
          margin="normal"
          required
          disabled={loading}
        />
        
        <TextField
          name="description"
          variant="outlined"
          label="What do you want to share?"
          fullWidth
          multiline
          rows={4}
          value={postData.description}
          onChange={handleChange}
          margin="normal"
          required
          disabled={loading}
        />
        
        <TextField
          name="image"
          variant="outlined"
          label="Image URL (optional)"
          fullWidth
          value={postData.image}
          onChange={handleChange}
          margin="normal"
          disabled={loading}
        />
        
        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          {editPost && (
            <Button
              onClick={onCancelEdit}
              sx={{ mr: 1 }}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Posting...' : (editPost ? 'Update Post' : 'Post')}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default PostForm;