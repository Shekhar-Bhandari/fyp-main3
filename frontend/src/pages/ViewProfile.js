import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Card, CardContent, Avatar, Grid, Divider,
    CircularProgress, Button
} from '@mui/material';
import {
    Email as EmailIcon, School as SchoolIcon, Work as WorkIcon, 
    GitHub as GitHubIcon, LinkedIn as LinkedInIcon, ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import AuthServices from '../Services/AuthServices'; // Assuming this service exists
import { useDarkMode } from '../components/DarkModeToggle'; // Adjust path as needed

const ViewProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const darkMode = useDarkMode();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Dark mode colors
    const bgColor = darkMode ? "#1a1a1a" : "#f5f5f5";
    const cardBgColor = darkMode ? "#2d2d2d" : "#ffffff";
    const textColor = darkMode ? "#ffffff" : "#000000";
    const secondaryTextColor = darkMode ? "#b0b0b0" : "#666666";

    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                // Call the new public service function to get profile data
                const response = await AuthServices.getPublicProfile(userId);
                setProfile(response.data);
            } catch (error) {
                console.error("Error fetching public profile:", error);
                toast.error("Could not load user profile.");
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    if (loading) {
        return (
            <Box sx={{ minHeight: "100vh", backgroundColor: bgColor, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2, color: textColor }}>Loading Profile...</Typography>
            </Box>
        );
    }

    if (!profile) {
        return (
            <Box sx={{ minHeight: "100vh", backgroundColor: bgColor, p: 4 }}>
                <Container maxWidth="md">
                    <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />}>Go Back</Button>
                    <Typography variant="h5" sx={{ mt: 3, color: textColor, textAlign: 'center' }}>
                        Profile Not Found
                    </Typography>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: bgColor, py: 4 }}>
            <Container maxWidth="md">
                <Button 
                    onClick={() => navigate(-1)} 
                    startIcon={<ArrowBackIcon />}
                    sx={{ mb: 3, color: textColor }}
                >
                    Back to Posts
                </Button>

                {/* Profile Header */}
                <Card sx={{ mb: 3, backgroundColor: cardBgColor, color: textColor }}>
                    <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <Avatar sx={{ width: 100, height: 100, fontSize: "2.5rem", backgroundColor: "primary.main" }}>
                                {profile.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                                    {profile.name}
                                </Typography>
                                <Typography variant="body1" sx={{ color: secondaryTextColor }}>
                                    {profile.bio || "No bio provided."}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* Profile Details Card */}
                <Card sx={{ mb: 3, backgroundColor: cardBgColor, color: textColor }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                            Public Information
                        </Typography>
                        <Divider sx={{ mb: 2, borderColor: darkMode ? "#444" : "#e0e0e0" }} />
                        
                        <Grid container spacing={2}>
                            {profile.email && (
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <EmailIcon sx={{ mr: 1, verticalAlign: 'middle', color: secondaryTextColor }} /> 
                                        {profile.email}
                                    </Typography>
                                </Grid>
                            )}
                            {profile.university && (
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle', color: secondaryTextColor }} /> 
                                        {profile.university}
                                    </Typography>
                                </Grid>
                            )}
                            {profile.major && (
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <WorkIcon sx={{ mr: 1, verticalAlign: 'middle', color: secondaryTextColor }} /> 
                                        {profile.major}
                                    </Typography>
                                </Grid>
                            )}
                            {profile.github && (
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <GitHubIcon sx={{ mr: 1, verticalAlign: 'middle', color: secondaryTextColor }} /> 
                                        <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" style={{ color: textColor }}>
                                            @{profile.github}
                                        </a>
                                    </Typography>
                                </Grid>
                            )}
                            {profile.linkedin && (
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <LinkedInIcon sx={{ mr: 1, verticalAlign: 'middle', color: secondaryTextColor }} /> 
                                        <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: textColor }}>
                                            {profile.linkedin}
                                        </a>
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                </Card>
                
                {/* Optional: Display skills/interests here */}

            </Container>
        </Box>
    );
};

export default ViewProfile;