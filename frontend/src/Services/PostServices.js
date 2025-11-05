// src/Services/PostServices.js
import api from "./api";

const PostServices = {
  // Fetches posts for a specific user ID
  /**
   * @description Fetches all posts created by a specific user.
   * @param {string} userId - The ID of the user whose posts to fetch.
   */
  getUserPosts: async (userId) => {
    try {
      // NOTE: Unlike getMyPosts, this endpoint typically doesn't need a token 
      // if you're viewing a public profile, but including it doesn't hurt.
      const user = JSON.parse(localStorage.getItem("todoapp"));
      const token = user?.token;

      // Assuming your backend endpoint is /posts/user/:userId
      const url = `/posts/user/${userId}`;
      
      return await api.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (error) {
      console.error('Error in getUserPosts:', error);
      throw error;
    }
  },

  // Fetches all posts, optionally filtered by specialization
  getAllPosts: async (specialization = "") => {
    try {
      const user = JSON.parse(localStorage.getItem("todoapp"));
      const token = user?.token;
      let url = "/posts";
      if (specialization) url += `?specialization=${encodeURIComponent(specialization)}`;
      
      return await api.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (error) {
      console.error('Error in getAllPosts:', error);
      throw error;
    }
  },
  
  // Records a view for a specific post.
  viewPost: async (id) => {
    try {
      const user = JSON.parse(localStorage.getItem("todoapp"));
      const token = user?.token;

      // Use a PUT request to the /posts/:id/view endpoint
      const response = await api.put(`/posts/${id}/view`, {}, { 
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      return response;
    } catch (error) {
      console.error('Error in viewPost:', error);
      throw error;
    }
  },

  // Fetches posts created by the current user
  getMyPosts: async () => {
    try {
      const token = JSON.parse(localStorage.getItem("todoapp"))?.token;
      return await api.get("/posts/my-posts", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (error) {
      console.error('Error in getMyPosts:', error);
      throw error;
    }
  },

  // Likes or unlikes a post
  likePost: async (id) => {
    try {
      const user = JSON.parse(localStorage.getItem("todoapp"));
      const token = user?.token;
      
      if (!token) {
        throw new Error('Authentication token is missing');
      }

      console.log('=== PostServices.likePost ===');
      console.log('Post ID:', id);
      console.log('User ID:', user._id);
      console.log('Token exists:', !!token);

      const response = await api.put(`/posts/${id}/like`, {}, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('Like response received:', response.data);
      return response;
    } catch (error) {
      console.error('=== Error in PostServices.likePost ===');
      console.error('Error:', error);
      console.error('Response:', error.response?.data);
      throw error;
    }
  },

  // Creates a new post
  createPost: async (data) => {
    try {
      const token = JSON.parse(localStorage.getItem("todoapp"))?.token;
      const isFormData = data instanceof FormData;
      
      return await api.post("/posts", data, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(isFormData && { 'Content-Type': 'multipart/form-data' })
        },
      });
    } catch (error) {
      console.error('Error in createPost:', error);
      throw error;
    }
  },

  // Updates an existing post
  updatePost: async (id, data) => {
    try {
      const token = JSON.parse(localStorage.getItem("todoapp"))?.token;
      const isFormData = data instanceof FormData;
      
      return await api.put(`/posts/${id}`, data, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(isFormData && { 'Content-Type': 'multipart/form-data' })
        },
      });
    } catch (error) {
      console.error('Error in updatePost:', error);
      throw error;
    }
  },

  // Deletes a post
  deletePost: async (id) => {
    try {
      const token = JSON.parse(localStorage.getItem("todoapp"))?.token;
      return await api.delete(`/posts/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (error) {
      console.error('Error in deletePost:', error);
      throw error;
    }
  },

  // Adds a comment to a post
  addComment: async (postId, text) => {
    try {
      const token = JSON.parse(localStorage.getItem("todoapp"))?.token;
      if (!token) throw new Error("Authentication token is missing.");

      return await api.post(`/posts/${postId}/comment`, { text }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Error in addComment:', error);
      throw error;
    }
  },
};

export default PostServices;