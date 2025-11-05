// src/pages/Auth.js
import React, { useState } from "react";
import { Avatar, Button, Paper, Grid, Typography, Container } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";
import AuthServices from "../Services/AuthServices";
import toast from "react-hot-toast";
import Input from "../components/Input";
import "../styles/auth.css";

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  // 🔥 CENTRALIZED LOGIN SUCCESS HANDLER WITH ROUTING LOGIC
  const handleLoginSuccess = (userData) => {
    try {
      // Save user data to localStorage with all fields
      localStorage.setItem(
        "todoapp",
        JSON.stringify({
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          token: userData.token,
          profileSetupComplete: userData.profileSetupComplete || false,
          ...userData
        })
      );
      
      toast.success(isSignup ? 'Account created successfully! 🎉' : 'Login successful! 🎉');
      
      // 🔥 ROUTING LOGIC BASED ON PROFILE SETUP STATUS
      if (userData.profileSetupComplete === true) {
        // User has already completed profile setup - go to home
        console.log('✅ Profile already complete, redirecting to home');
        navigate('/home', { replace: true });
      } else {
        // First-time login or profile not yet completed - go to profile setup
        console.log('📝 Profile incomplete, redirecting to setup');
        navigate('/profile-setup', { replace: true });
      }
      
    } catch (error) {
      console.error('Login success handler error:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (isSignup && !formData.name?.trim()) {
      toast.error('Name is required for signup');
      return;
    }

    if (!formData.email?.trim()) {
      toast.error('Email is required');
      return;
    }

    if (!formData.password) {
      toast.error('Password is required');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        // 🔥 SIGNUP FLOW
        const signupResponse = await AuthServices.register(formData);
        console.log('📥 Signup response:', signupResponse.data);
        
        // After successful signup, redirect based on profileSetupComplete
        handleLoginSuccess(signupResponse.data);
        
      } else {
        // 🔥 LOGIN FLOW
        const loginResponse = await AuthServices.login(formData);
        console.log('📥 Login response:', loginResponse.data);
        
        // After successful login, redirect based on profileSetupComplete
        handleLoginSuccess(loginResponse.data);
      }
    } catch (error) {
      console.error('❌ Auth error:', error);
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignup((prev) => !prev);
    // Clear form when switching modes
    setFormData({ name: "", email: "", password: "" });
  };

  return (
    <div className="auth-container">
      <Container component="main" maxWidth="xs">
        <Paper elevation={3} className="auth-paper">
          <Avatar className="auth-avatar">
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" className="auth-title">
            {isSignup ? "Create Account" : "Welcome Back"}
          </Typography>
          <Typography className="auth-subtitle">
            {isSignup 
              ? "Sign up to get started with your account" 
              : "Sign in to continue to your account"}
          </Typography>

          <form onSubmit={handleSubmit} className="auth-form">
            <Grid container spacing={2}>
              {isSignup && (
                <Grid item xs={12}>
                  <div className="auth-input-container">
                    <Input 
                      name="name" 
                      label="Full Name" 
                      handleChange={handleChange}
                      value={formData.name}
                      autoFocus
                      disabled={loading}
                    />
                  </div>
                </Grid>
              )}
              <Grid item xs={12}>
                <div className="auth-input-container">
                  <Input 
                    name="email" 
                    label="Email Address" 
                    handleChange={handleChange}
                    value={formData.email}
                    type="email"
                    autoFocus={!isSignup}
                    disabled={loading}
                  />
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className="auth-input-container">
                  <Input 
                    name="password" 
                    label="Password" 
                    handleChange={handleChange}
                    value={formData.password}
                    type={showPassword ? "text" : "password"}
                    handleShowPassword={handleShowPassword}
                    disabled={loading}
                  />
                </div>
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="auth-submit-btn"
              disabled={loading}
              style={{
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (isSignup ? 'Creating Account...' : 'Signing In...') : (isSignup ? "Sign Up" : "Sign In")}
            </Button>

            <div className="auth-switch-container">
              <Button 
                onClick={switchMode} 
                className="auth-switch-btn"
                disabled={loading}
              >
                {isSignup
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign Up"}
              </Button>
            </div>
          </form>
        </Paper>
      </Container>
    </div>
  );
};

export default Auth;