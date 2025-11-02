// src/Services/PostServices.js
import api from "./api";

const PostServices = {
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
  
  // === NEW FUNCTION ADDED TO FIX THE ERROR ===
  incrementViews: async (id) => {
    try {
      const user = JSON.parse(localStorage.getItem("todoapp"));
      const token = user?.token;

      if (!token) {
        // If the user is not logged in, we might allow a view but skip authentication
        // or just log an error if the backend requires authentication for this endpoint.
        // Assuming the backend still tracks the view without authentication for simplicity here,
        // but if it requires a token, you'd handle the error or return early.
      }

      // API call to the backend endpoint to increment the view count
      return await api.put(`/posts/${id}/view`, {}, { 
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (error) {
      console.error('Error in incrementViews:', error);
      // We often silence this error slightly since view counts are non-critical,
      // but we throw it for consistency.
      throw error;
    }
  },
  // ============================================

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