// Services/api.js
{/*
  import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // backend base URL
});

export default api;
*/}

// Services/api.js
// src/Services/api.js
// src/Services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach token to all requests
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("todoapp"));
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    
    // For FormData, let the browser set the Content-Type (includes boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // Log request for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error("Response Error:", error.response.status, error.response.data);
      
      // Handle 401 Unauthorized - redirect to login
      if (error.response.status === 401) {
        localStorage.removeItem("todoapp");
        window.location.href = "/auth";
      }
      
      // Handle 403 Forbidden
      if (error.response.status === 403) {
        console.error("Access forbidden");
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("No Response Error:", error.request);
      console.error("Make sure backend is running on http://localhost:8080");
    } else {
      // Something else happened
      console.error("Error:", error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
