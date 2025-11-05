// src/pages/MyPosts.js
import React, { useEffect, useState } from "react";
import { Container, Card, CardContent, CardMedia, Typography, Grid, Box, Button } from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import PostServices from "../Services/PostServices";
import toast from "react-hot-toast";

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Safely retrieve current user ID from localStorage
  const currentUserId = JSON.parse(localStorage.getItem("todoapp"))?._id;

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      const res = await PostServices.getMyPosts();
      setPosts(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load your posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
        fetchMyPosts();
    } else {
        setLoading(false);
        // Optional: Navigate to login if user is missing
    }
  }, [currentUserId]);

  const handleLike = async (postId) => {
    if (!currentUserId) {
        toast.error("You must be logged in to like a post.");
        return;
    }
    try {
      const res = await PostServices.likePost(postId);
      const updatedPost = res.data;
      setPosts(prevPosts =>
        prevPosts.map(post => (post._id === updatedPost._id ? updatedPost : post))
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to like/unlike post");
    }
  };

  return (
    <Container sx={{ mt: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}>
        My Posts
      </Typography>

      <Grid container direction="column" spacing={2}>
        {loading ? (
          <Typography sx={{ textAlign: "center" }}>Loading...</Typography>
        ) : posts.length === 0 ? (
          <Typography sx={{ textAlign: "center" }}>You have not created any posts yet.</Typography>
        ) : (
          posts.map((post) => {
            const likedByUser = post.likes.some(like => String(like.user?._id || like.user) === String(currentUserId));
            
            return (
              <Card key={post._id} sx={{ mb: 2, p: 2, boxShadow: 3 }}>
                {post.image && <CardMedia component="img" height="200" image={post.image} alt={post.title} sx={{ borderRadius: 1, mb: 2 }} />}
                
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                  <Typography variant="h6" gutterBottom>{post.title}</Typography>
                  <Typography variant="body1" color="text.secondary">{post.description}</Typography>
                  <Typography variant="caption" display="block" color="text.hint" sx={{ mt: 1 }}>
                    Specialization: **{post.specialization}**
                  </Typography>
                  
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2, borderTop: '1px solid #e0e0e0', pt: 1 }}>
                    
                    {/* The Enhanced Like Button */}
                    <Button
                      onClick={() => handleLike(post._id)}
                      // Variant controls the button's background/border: Contained (blue/active) or Outlined (grey/inactive)
                      variant={likedByUser ? "contained" : "outlined"}
                      color="primary" // Ensures the default color scheme is blue
                      size="small"
                      sx={{
                        // Custom styles to achieve the Facebook/Green Icon look
                        minWidth: '70px', // Ensure button has minimum width
                        textTransform: 'none', // Prevent capitalization
                        
                        // Style for the Icon
                        '& .MuiButton-startIcon': {
                          // If liked, the button is 'contained', so the icon is white by default.
                          // We override it here to be green for success feedback.
                          color: likedByUser ? '#10b981' : 'inherit', // Use a success green color
                        },
                      }}
                    >
                        <ThumbUpIcon sx={{ mr: 0.5 }} />
                        {post.likes.length}
                    </Button>
                    
                    {/* Display the word "Like(s)" next to the button */}
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            ml: 0.5, 
                            color: likedByUser ? 'primary.main' : 'text.secondary', 
                            fontWeight: likedByUser ? 'bold' : 'regular' 
                        }}
                    >
                        Like{post.likes.length !== 1 ? "s" : ""}
                    </Typography>

                  </Box>
                </CardContent>
              </Card>
            );
          })
        )}
      </Grid>
    </Container>
  );
};

export default MyPosts;