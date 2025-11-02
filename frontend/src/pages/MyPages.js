// src/pages/MyPosts.js
import React, { useEffect, useState } from "react";
import { Container, Card, CardContent, CardMedia, Typography, Grid, Box, Button } from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import PostServices from "../Services/PostServices";
import toast from "react-hot-toast";

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    fetchMyPosts();
  }, []);

  const handleLike = async (postId) => {
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
          posts.map((post, index) => {
            const likedByUser = post.likes.some(like => like.user?._id === JSON.parse(localStorage.getItem("todoapp"))?._id);
            return (
              <Card key={post._id} sx={{ mb: 2 }}>
                {post.image && <CardMedia component="img" height="200" image={post.image} alt={post.title} />}
                <CardContent>
                  <Typography variant="h6">{post.title}</Typography>
                  <Typography variant="body1">{post.description}</Typography>
                  <Typography variant="caption">Specialization: {post.specialization}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
                    <Button
                      onClick={() => handleLike(post._id)}
                      startIcon={<ThumbUpIcon />}
                      variant={likedByUser ? "contained" : "outlined"}
                    >
                      {post.likes.length} Like{post.likes.length !== 1 ? "s" : ""}
                    </Button>
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
