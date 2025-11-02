// AuthServices.js (Original - Names are correct here)
import api from "./api";

const AuthServices = {
  register: async (data) => {
    return await api.post("/auth/register", data);
  },

  login: async (data) => {
    return await api.post("/auth/login", data);
  },

  // Get public profile by user ID
  getPublicProfile: async (userId) => {
    const token = JSON.parse(localStorage.getItem("todoapp"))?.token;
    return await api.get(`/auth/profile/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  // Get current user profile
  getCurrentUser: async () => {
    const token = JSON.parse(localStorage.getItem("todoapp"))?.token;
    return await api.get("/auth/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  // Update current user profile
  updateProfile: async (data) => {
    const token = JSON.parse(localStorage.getItem("todoapp"))?.token;
    return await api.put("/auth/profile", data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
};

export default AuthServices;