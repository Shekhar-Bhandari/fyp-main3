import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, Avatar, CircularProgress } from '@mui/material';
import toast from 'react-hot-toast';
import UserServices from '../Services/UserServices'; // 👈 Must exist and export getUserById
import { useDarkMode } from '../components/DarkModeToggle';

const PublicProfile = () => {
  // 1. Get the ID from the URL
  const { userId } = useParams(); 
  
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const darkMode = useDarkMode();
  
  // Dark mode colors
  const bgColor = darkMode ? "#1a1a1a" : "#f5f5f5";
  const textColor = darkMode ? "#ffffff" : "#000000";
  const cardBgColor = darkMode ? "#2d2d2d" : "#ffffff";


  useEffect(() => {
    if (!userId) {
        setLoading(false);
        return;
    }
    
    // 2. Fetch the user data using the ID
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // This is the call that retrieves the user object from the backend
        const res = await UserServices.getUserById(userId); 
        
        // Assuming your service returns the user object directly (or res.data)
        setProfileUser(res.data || res); 
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to load user profile. It might not exist.");
        setProfileUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  // 3. Handle loading and not found states
  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: bgColor, pt: 10, textAlign: "center" }}>
        <CircularProgress color="primary" />
        <Typography sx={{ color: textColor, mt: 2 }}>Loading profile...</Typography>
      </Box>
    );
  }

  if (!profileUser) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: bgColor, pt: 10, textAlign: "center" }}>
        <Typography variant="h5" sx={{ color: textColor }}>User not found or data is corrupted.</Typography>
      </Box>
    );
  }

  // 4. Render the profile details
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: bgColor, pb: 4 }}>
      <Container maxWidth="sm" sx={{ pt: 4 }}>
        <Box sx={{ p: 4, borderRadius: 2, boxShadow: 3, backgroundColor: cardBgColor, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: textColor, mb: 3 }}>
            Public Profile
          </Typography>

          <Avatar
            sx={{
              width: 120,
              height: 120,
              fontSize: "3rem",
              backgroundColor: "primary.main",
              mx: 'auto',
              mb: 3
            }}
          >
            {profileUser.name ? profileUser.name.charAt(0).toUpperCase() : '?'}
          </Avatar>
          
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 0.5, color: textColor }}>
            {profileUser.name}
          </Typography>
          <Typography variant="body1" sx={{ color: textColor }}>
            Email: {profileUser.email}
          </Typography>
          <Typography variant="caption" sx={{ color: textColor, display: 'block', mt: 1 }}>
            User ID: {userId}
          </Typography>
          
          <Box sx={{ mt: 3, borderTop: `1px solid ${darkMode ? '#444' : '#ddd'}`, pt: 2 }}>
             <Typography variant="h6" sx={{ color: textColor }}>
                User Activity
            </Typography>
             <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                *Posts by this user would be fetched and displayed here.*
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default PublicProfile;