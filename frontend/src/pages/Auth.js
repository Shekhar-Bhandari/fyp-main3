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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        await AuthServices.register(formData);
        toast.success("Registered successfully! Please login.");
        setIsSignup(false);
      } else {
        const res = await AuthServices.login(formData);
        localStorage.setItem(
          "todoapp",
          JSON.stringify({
            _id: res.data._id,
            name: res.data.name,
            email: res.data.email,
            token: res.data.token,
            profileSetupComplete: res.data.profileSetupComplete,
            ...res.data
          })
        );
        toast.success("Login successful!");
        navigate("/profile-setup");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      console.error(error);
    }
  };

  const switchMode = () => setIsSignup((prev) => !prev);

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
                      autoFocus 
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
                    type="email" 
                  />
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className="auth-input-container">
                  <Input 
                    name="password" 
                    label="Password" 
                    handleChange={handleChange} 
                    type={showPassword ? "text" : "password"}
                    handleShowPassword={handleShowPassword}
                  />
                </div>
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="auth-submit-btn"
            >
              {isSignup ? "Sign Up" : "Sign In"}
            </Button>

            <div className="auth-switch-container">
              <Button onClick={switchMode} className="auth-switch-btn">
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