// src/Services/AuthServices.js (FIXED VERSION)
import api from "./api";

// 🚨 Define the correct backend path (must match the server.js mount point) 🚨
const AUTH_BASE_URL = "/users"; 

const AuthServices = {
  // --- LOGIN & REGISTER ---
  
  register: async (data) => {
    // FIX: Calls POST /api/users/register
    return await api.post(`${AUTH_BASE_URL}/register`, data);
  },

  login: async (data) => {
    // FIX: Calls POST /api/users/login (Resolves the current 404 error)
    return await api.post(`${AUTH_BASE_URL}/login`, data);
  },

  // --- GET & UPDATE ---

  // Get public profile by user ID
  getPublicProfile: async (userId) => {
    // FIX: Calls GET /api/users/profile/:userId
    // NOTE: Removed manual token header as api.js handles it globally
    return await api.get(`${AUTH_BASE_URL}/profile/${userId}`);
  },

  // Get current user profile
  getCurrentUser: async () => {
    // FIX: Calls GET /api/users/me
    // NOTE: Removed manual token header as api.js handles it globally
    return await api.get(`${AUTH_BASE_URL}/me`);
  },

  // Update current user profile
  updateProfile: async (data) => {
    // FIX: Calls PUT /api/users/profile (Resolves previous profile 404 error)
    // NOTE: Removed manual token header as api.js handles it globally
    return await api.put(`${AUTH_BASE_URL}/profile`, data);
  },
};

export default AuthServices;