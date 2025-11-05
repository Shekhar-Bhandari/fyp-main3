import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Card, CardContent, Avatar, Grid, Divider,
    CircularProgress, Button, Chip, Modal, IconButton, Paper
} from '@mui/material';
import {
    Email as EmailIcon, School as SchoolIcon, Work as WorkIcon, 
    GitHub as GitHubIcon, LinkedIn as LinkedInIcon, ArrowBack as ArrowBackIcon,
    Phone as PhoneIcon, CalendarToday as CalendarIcon, 
    Book as PostIcon, ThumbUp as LikeIcon, Comment as CommentIcon, Close as CloseIcon
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import AuthServices from '../Services/AuthServices'; 
import PostServices from '../Services/PostServices'; 
import { useDarkMode } from '../components/DarkModeToggle'; 

// --- Custom Green Color Palette ---
const GREEN_PRIMARY = '#10b981'; // Tailwind Green 500
const GREEN_DARK = '#059669';   // Tailwind Green 600

// --- Utility Functions (Kept simple) ---
const formatRelativeTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(); 
};

// =========================================================
// === 🚨 INLINE COMPONENT 1: PostCard 🚨
// This simulates the look of a post item on your feed.
// =========================================================

const PostCard = ({ post, onClick, darkMode }) => {
    const cardBg = darkMode ? '#3a3a3a' : '#f8f8f8';
    const textColor = darkMode ? '#ffffff' : '#000000';
    const secondaryTextColor = darkMode ? '#b0b0b0' : '#666666';

    return (
        <Card 
            onClick={onClick}
            sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: '0.3s',
                backgroundColor: cardBg,
                border: `1px solid ${GREEN_PRIMARY}50`,
                '&:hover': { 
                    boxShadow: 6,
                    transform: 'translateY(-2px)'
                }
            }}
        >
            {post.image && (
                <Box 
                    sx={{ 
                        height: 150, 
                        backgroundImage: `url(${post.image})`, 
                        backgroundSize: 'cover', 
                        backgroundPosition: 'center',
                        borderBottom: `1px solid ${GREEN_PRIMARY}30`
                    }}
                />
            )}
            <CardContent>
                <Typography 
                    variant="subtitle1" 
                    sx={{ fontWeight: 'bold', color: GREEN_PRIMARY, mb: 1 }}
                    title={post.title}
                >
                    {post.title.substring(0, 40) + (post.title.length > 40 ? '...' : '')}
                </Typography>
                <Typography variant="body2" noWrap sx={{ color: secondaryTextColor, mb: 1 }}>
                    {post.description.substring(0, 80) + (post.description.length > 80 ? '...' : '')}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Chip 
                        label={post.specialization} 
                        size="small" 
                        sx={{ 
                            bgcolor: GREEN_DARK + '10', 
                            color: GREEN_DARK, 
                            fontWeight: 'bold',
                            height: 20
                        }} 
                    />
                    <Typography variant="caption" sx={{ color: secondaryTextColor }}>
                        {formatRelativeTime(post.createdAt)}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};


// =========================================================
// === 🚨 INLINE COMPONENT 2: PostDetailModal 🚨
// This simulates the modal/dialog that opens when a post is clicked.
// =========================================================

const PostDetailModal = ({ open, onClose, post }) => {
    const darkMode = useDarkMode();
    const modalBg = darkMode ? '#1e1e1e' : '#ffffff';
    const textColor = darkMode ? '#ffffff' : '#000000';
    const secondaryTextColor = darkMode ? '#b0b0b0' : '#666666';
    
    // Style for the centered modal content
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '95%', sm: 600, md: 800 },
        maxHeight: '90vh',
        overflowY: 'auto',
        bgcolor: modalBg,
        boxShadow: 24,
        borderRadius: '8px',
        p: 4,
    };

    if (!post) return null;

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="post-detail-title"
            aria-describedby="post-detail-description"
        >
            <Paper sx={style}>
                <IconButton 
                    onClick={onClose} 
                    sx={{ position: 'absolute', right: 8, top: 8, color: secondaryTextColor }}
                >
                    <CloseIcon />
                </IconButton>
                
                <Typography id="post-detail-title" variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: GREEN_PRIMARY }}>
                    {post.title}
                </Typography>
                
                {post.image && (
                    <Box 
                        component="img"
                        src={post.image}
                        alt={post.title}
                        sx={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: '4px', mb: 2 }}
                    />
                )}

                <Typography variant="body1" sx={{ color: textColor, mb: 3 }}>
                    {post.description}
                </Typography>

                <Divider sx={{ mb: 2, borderColor: secondaryTextColor + '40' }} />

                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: secondaryTextColor }}>
                            Specialization: <strong style={{ color: GREEN_DARK }}>{post.specialization}</strong>
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: secondaryTextColor, textAlign: 'right' }}>
                            Posted: {formatRelativeTime(post.createdAt)}
                        </Typography>
                    </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', gap: 3 }}>
                    <Chip 
                        icon={<LikeIcon style={{ fontSize: 18 }} />} 
                        label={`${post.likes?.length || 0} Likes`} 
                        sx={{ bgcolor: GREEN_PRIMARY + '20', color: GREEN_PRIMARY, fontWeight: 'medium' }} 
                    />
                    <Chip 
                        icon={<CommentIcon style={{ fontSize: 18 }} />} 
                        label={`${post.comments?.length || 0} Comments`} 
                        sx={{ bgcolor: GREEN_PRIMARY + '20', color: GREEN_PRIMARY, fontWeight: 'medium' }} 
                    />
                </Box>

                {/* NOTE: You would typically add the actual comments section here */}

            </Paper>
        </Modal>
    );
};

// =========================================================
// === MAIN COMPONENT: ViewProfile ===
// =========================================================

const ViewProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const darkMode = useDarkMode();
    
    // --- State for Profile and Posts ---
    const [profile, setProfile] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(false);
    
    // --- State for Modal/Dialog ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [openPost, setOpenPost] = useState(null);       

    // --- Dynamic UI Colors (Green & White Theme) ---
    const bgColor = darkMode ? "#1a1a1a" : "#ffffff"; 
    const cardBgColor = darkMode ? "#2d2d2d" : "#f0fff0";
    const textColor = darkMode ? "#ffffff" : "#000000";
    const secondaryTextColor = darkMode ? "#b0b0b0" : "#666666";
    const iconColor = GREEN_PRIMARY;

    // --- Modal Handlers ---
    const handlePostClick = useCallback((post) => {
        setOpenPost(post);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setOpenPost(null);
    }, []);


    // --- Effect 1: Fetch Profile Data ---
    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
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

    // --- Effect 2: Fetch User Posts ---
    useEffect(() => {
        if (!profile?._id) return;

        const fetchPosts = async () => {
            setLoadingPosts(true);
            try {
                const response = await PostServices.getUserPosts(profile._id); 
                setUserPosts(response.data || []); 
            } catch (error) {
                console.error("Error fetching user posts:", error);
                toast.error("Could not load user posts.");
            } finally {
                setLoadingPosts(false);
            }
        };

        fetchPosts();
    }, [profile]);


    // --- Loading and Not Found States ---
    if (loading) {
        return (
            <Box sx={{ minHeight: "100vh", backgroundColor: bgColor, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress sx={{ color: GREEN_PRIMARY }} />
                <Typography sx={{ ml: 2, color: textColor }}>Loading Profile...</Typography>
            </Box>
        );
    }

    if (!profile) {
        return (
            <Box sx={{ minHeight: "100vh", backgroundColor: bgColor, p: 4 }}>
                <Container maxWidth="md">
                    <Button 
                        onClick={() => navigate(-1)} 
                        startIcon={<ArrowBackIcon />}
                        sx={{ color: iconColor }}
                    >
                        Go Back
                    </Button>
                    <Typography variant="h5" sx={{ mt: 3, color: textColor, textAlign: 'center' }}>
                        Profile Not Found
                    </Typography>
                </Container>
            </Box>
        );
    }
    
    // --- Main Render ---
    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: bgColor, py: 4 }}>
            <Container maxWidth="md">
                <Button 
                    onClick={() => navigate(-1)} 
                    startIcon={<ArrowBackIcon />}
                    sx={{ mb: 3, color: GREEN_PRIMARY }}
                >
                    Back to Feed
                </Button>

                {/* Profile Header Card */}
                <Card sx={{ mb: 3, backgroundColor: cardBgColor, color: textColor, border: `1px solid ${GREEN_PRIMARY}50` }}>
                    <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <Avatar sx={{ width: 100, height: 100, fontSize: "2.5rem", backgroundColor: GREEN_PRIMARY }}>
                                {profile.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: "bold", mb: 0.5, color: textColor }}>
                                    {profile.name}
                                </Typography>
                                <Typography variant="body1" sx={{ color: GREEN_DARK, fontWeight: 'medium' }}>
                                    {profile.major && `Studying ${profile.major}`}
                                </Typography>
                                {profile.bio && (
                                    <Typography variant="body2" sx={{ color: secondaryTextColor, mt: 1 }}>
                                        {profile.bio}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* Profile Details Card (All Data) */}
                <Card sx={{ mb: 3, backgroundColor: cardBgColor, color: textColor, border: `1px solid ${GREEN_PRIMARY}50` }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: GREEN_PRIMARY }}>
                            Contact & Social
                        </Typography>
                        <Divider sx={{ mb: 2, borderColor: darkMode ? "#444" : "#e0e0e0" }} />
                        
                        <Grid container spacing={3}>
                            {profile.email && (
                                <Grid item xs={12} sm={6} md={4}>
                                    <Typography variant="body2" sx={{ color: secondaryTextColor }}>Email</Typography>
                                    <Typography variant="body1">
                                        <EmailIcon sx={{ mr: 1, verticalAlign: 'middle', color: iconColor, fontSize: 18 }} /> 
                                        {profile.email}
                                    </Typography>
                                </Grid>
                            )}
                            {profile.phone && (
                                <Grid item xs={12} sm={6} md={4}>
                                    <Typography variant="body2" sx={{ color: secondaryTextColor }}>Phone</Typography>
                                    <Typography variant="body1">
                                        <PhoneIcon sx={{ mr: 1, verticalAlign: 'middle', color: iconColor, fontSize: 18 }} /> 
                                        {profile.phone}
                                    </Typography>
                                </Grid>
                            )}
                            {profile.year && (
                                <Grid item xs={12} sm={6} md={4}>
                                    <Typography variant="body2" sx={{ color: secondaryTextColor }}>Year</Typography>
                                    <Typography variant="body1">
                                        <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle', color: iconColor, fontSize: 18 }} /> 
                                        {profile.year}
                                    </Typography>
                                </Grid>
                            )}
                            {profile.university && (
                                <Grid item xs={12} sm={6} md={4}>
                                    <Typography variant="body2" sx={{ color: secondaryTextColor }}>University</Typography>
                                    <Typography variant="body1">
                                        <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle', color: iconColor, fontSize: 18 }} /> 
                                        {profile.university}
                                    </Typography>
                                </Grid>
                            )}
                            {profile.major && (
                                <Grid item xs={12} sm={6} md={4}>
                                    <Typography variant="body2" sx={{ color: secondaryTextColor }}>Major</Typography>
                                    <Typography variant="body1">
                                        <WorkIcon sx={{ mr: 1, verticalAlign: 'middle', color: iconColor, fontSize: 18 }} /> 
                                        {profile.major}
                                    </Typography>
                                </Grid>
                            )}
                            {profile.github && (
                                <Grid item xs={12} sm={6} md={4}>
                                    <Typography variant="body2" sx={{ color: secondaryTextColor }}>GitHub</Typography>
                                    <Typography variant="body1">
                                        <GitHubIcon sx={{ mr: 1, verticalAlign: 'middle', color: iconColor, fontSize: 18 }} /> 
                                        <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" style={{ color: GREEN_DARK, textDecoration: 'none', fontWeight: 'bold' }}>
                                            @{profile.github}
                                        </a>
                                    </Typography>
                                </Grid>
                            )}
                            {profile.linkedin && (
                                <Grid item xs={12} sm={6} md={4}>
                                    <Typography variant="body2" sx={{ color: secondaryTextColor }}>LinkedIn</Typography>
                                    <Typography variant="body1">
                                        <LinkedInIcon sx={{ mr: 1, verticalAlign: 'middle', color: iconColor, fontSize: 18 }} /> 
                                        <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: GREEN_DARK, textDecoration: 'none', fontWeight: 'bold' }}>
                                            /{profile.linkedin}
                                        </a>
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                </Card>
                
                {/* User Posts Section */}
                <Card sx={{ mb: 3, backgroundColor: cardBgColor, color: textColor, border: `1px solid ${GREEN_PRIMARY}50` }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: GREEN_PRIMARY, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PostIcon /> {profile.name}'s Recent Posts
                        </Typography>
                        <Divider sx={{ mb: 2, borderColor: darkMode ? "#444" : "#e0e0e0" }} />

                        {loadingPosts ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                <CircularProgress size={24} sx={{ color: GREEN_PRIMARY }} />
                            </Box>
                        ) : userPosts.length === 0 ? (
                            <Typography variant="body1" sx={{ color: secondaryTextColor, textAlign: 'center', py: 3 }}>
                                This user has no public posts yet.
                            </Typography>
                        ) : (
                            <Grid container spacing={3}>
                                {userPosts.map((post) => (
                                    <Grid item xs={12} sm={6} md={4} key={post._id}>
                                        <PostCard 
                                            post={post}
                                            onClick={() => handlePostClick(post)} 
                                            darkMode={darkMode}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </CardContent>
                </Card>
            </Container>

            {/* Post Detail Modal/Dialog */}
            {isModalOpen && openPost && (
                <PostDetailModal
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    post={openPost}
                />
            )}
        </Box>
    );
};

export default ViewProfile;