import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PostServices from "../Services/PostServices";
// 🚨 Ensure you have this import
import UserServices from "../Services/UserServices"; 
import VerticalNavbar from "../components/VerticalNavbar";
import {
  Edit as EditIcon,
  Mail as EmailIcon,
  Phone as PhoneIcon,
  Calendar as CalendarIcon,
  School as SchoolIcon,
  Briefcase as WorkIcon,
  Github as GitHubIcon,
  Linkedin as LinkedInIcon,
  Trash2 as DeleteIcon,
  ThumbsUp as ThumbUpIcon,
  MessageCircle as ChatBubbleIcon,
  X as CloseIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Bell as BellIcon,
  Plus as PlusIcon,
  LogOut as LogOutIcon,
} from "lucide-react";
import "../styles/navbar.css";
import "../styles/profile.css";

// ===== UTILITY FUNCTIONS (No changes needed here) =====
const calculateHotnessScore = (post) => (post.likes?.length || 0) * 0.75;

const isPostLikedByUser = (post, userId) => {
  return post?.likes?.some(like => String(like.user?._id || like.user) === String(userId));
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
};

const getSpecChipLabel = (specValue) => specValue || 'General';

// ===== POST CARD COMPONENT (No changes needed here) =====
const PostCard = React.memo(({ post, currentUser, onOpenDialog, onLike, onDeletePost }) => {
  const likedByUser = isPostLikedByUser(post, currentUser?._id);

  return (
    <div className="profile-post-card">
      <div className="post-card-content">
        <div className="post-card-header">
          <div className="post-card-title-section" onClick={() => onOpenDialog(post)}>
            <h3 className="post-card-title">{post.title}</h3>
            <span className="spec-badge">{getSpecChipLabel(post.specialization)}</span>
          </div>

          <div className="post-card-actions">
            <button 
              onClick={() => onDeletePost(post._id)}
              className="post-action-btn delete"
              title="Delete Post"
            >
              <DeleteIcon size={18} />
            </button>
          </div>
        </div>

        <p className="post-card-description">{post.description}</p>
        
        {post.media?.url && (
          <img
            src={post.media.url}
            alt="Post Media"
            className="post-card-media"
            onClick={() => onOpenDialog(post)}
          />
        )}

        <div className="post-card-divider"></div>

        <div className="post-card-stats">
          <div className="post-card-stats-left">
            <div className="stat-item">
              <ThumbUpIcon size={16} />
              <span>{post.likes.length}</span>
            </div>
            <div className="stat-item">
              <ChatBubbleIcon size={16} />
              <span>{post.comments.length}</span>
            </div>
          </div>

          <div className="post-card-stats-right">
            {/* UPDATED LIKE BUTTON */}
            <button
              onClick={() => onLike(post._id)}
              className={`like-btn ${likedByUser ? 'liked' : ''}`}
              aria-label={likedByUser ? "Unlike post" : "Like post"}
            >
              <ThumbUpIcon size={16} />
              {likedByUser ? "Liked" : "Like"}
            </button>
          </div>
        </div>

        <p className="post-timestamp">Posted: {formatRelativeTime(post.createdAt)}</p>
      </div>
    </div>
  );
});

// ===== FULL POST DIALOG COMPONENT (No changes needed here) =====
const FullPostDialog = React.memo(({ open, post, onClose, user, onLike, onAddComment, onNavigateProfile, newCommentText, setNewCommentText }) => {
  if (!post || !open) return null;

  const likedByUser = isPostLikedByUser(post, user?._id);
  const mediaUrl = post.media?.url || post.image || '';

  const handleCommentChange = (e) => {
    setNewCommentText(prev => ({ ...prev, [post._id]: e.target.value }));
  };

  const handlePostComment = () => {
    onAddComment(post._id);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="modal-title">{post.title}</h2>
          <button onClick={onClose} className="post-action-btn">
            <CloseIcon size={20} />
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'row', maxHeight: '70vh' }}>
          {/* Left: Post Content */}
          <div style={{ flex: '2', padding: '24px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <span className="spec-badge">{getSpecChipLabel(post.specialization)}</span>
              <span style={{ marginLeft: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                • Posted {formatRelativeTime(post.createdAt)}
              </span>
            </div>

            {mediaUrl && (
              <img
                src={mediaUrl}
                alt={post.title}
                style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px', marginBottom: '24px' }}
              />
            )}

            <p style={{ whiteSpace: 'pre-wrap', marginBottom: '24px', lineHeight: '1.6' }}>
              {post.description}
            </p>

            <div className="post-card-divider" style={{ marginBottom: '16px' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* UPDATED LIKE BUTTON */}
              <button
                onClick={() => onLike(post._id)}
                className={`stat-btn ${likedByUser ? 'liked' : ''}`}
                aria-label={likedByUser ? "Unlike post" : "Like post"}
              >
                <ThumbUpIcon size={18} />
                <span style={{ marginLeft: '4px' }}>
                    {likedByUser ? "Liked" : "Like"}
                </span>
                <span style={{ marginLeft: '8px', fontWeight: 'normal' }}>{post.likes.length}</span>
              </button>
              <div className="stat-item">
                <ChatBubbleIcon size={16} />
                <span>{post.comments.length} Comments</span>
              </div>
            </div>
          </div>

          {/* Right: Comments */}
          <div style={{ 
            flex: '1', 
            padding: '24px', 
            borderLeft: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '70vh' 
          }}>
            <h3 style={{ marginBottom: '16px', fontWeight: 'bold' }}>
              Comments ({post.comments.length})
            </h3>

            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px' }}>
              {post.comments.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
                  Be the first to comment!
                </p>
              ) : (
                post.comments.map((comment) => (
                  <div key={comment._id} style={{ 
                    marginBottom: '12px', 
                    padding: '12px',
                    borderBottom: '1px dotted var(--border-color)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                      <div 
                        className="author-avatar"
                        onClick={() => onNavigateProfile(comment.user?._id)}
                        style={{ cursor: 'pointer', width: '28px', height: '28px', fontSize: '12px' }}
                      >
                        {comment.user?.name?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <span 
                        style={{ 
                          marginLeft: '8px',
                          fontWeight: 'bold', 
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                        onClick={() => onNavigateProfile(comment.user?._id)}
                      >
                        {comment.user?.name || 'Anonymous User'}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginLeft: '36px' }}>
                      {comment.text}
                    </p>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '36px' }}>
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            {user?.token && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <textarea
                  placeholder="Write a comment..."
                  value={newCommentText[post._id] || ''}
                  onChange={handleCommentChange}
                  className="form-input form-textarea"
                  rows={2}
                  style={{ marginBottom: '8px' }}
                />
                <button
                  onClick={handlePostComment}
                  className="modal-btn modal-btn-save"
                  style={{ width: '100%' }}
                  disabled={!newCommentText[post._id]?.trim()}
                >
                  Post Comment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// ===== MAIN PROFILE COMPONENT (MODIFIED) =====
const Profile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [darkMode, setDarkMode] = useState(false);
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // New state for saving status
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newCommentText, setNewCommentText] = useState({});
  const [editForm, setEditForm] = useState({
    name: "", email: "", phone: "", bio: "", university: "", major: "", 
    year: "", github: "", linkedin: "",
  });
  
  const navigate = useNavigate();

  // Dark Mode Initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  // Update Post in State
  const updatePostInState = useCallback((updatedPost) => {
    const postWithScore = { 
      ...updatedPost, 
      hotnessScore: calculateHotnessScore(updatedPost) 
    };

    setUserPosts((prevPosts) => {
      const updated = prevPosts.map((post) => 
        post._id === updatedPost._id ? postWithScore : post
      );
      return updated;
    });

    if (selectedPost && selectedPost._id === updatedPost._id) {
      setSelectedPost(postWithScore);
    }
  }, [selectedPost]);

  // Update User Info from Local Storage
  const updateUser = () => {
    const user = JSON.parse(localStorage.getItem("todoapp"));
    setCurrentUser(user);
    if (user) {
      // Populate edit form with current user data (including profile fields)
      setEditForm({
        name: user.name || "", email: user.email || "", phone: user.phone || "",
        bio: user.bio || "", university: user.university || "", major: user.major || "",
        year: user.year || "", github: user.github || "", linkedin: user.linkedin || "",
      });
    }
  };

  // Fetch User Posts
  const fetchUserPosts = async () => {
    setLoadingPosts(true);
    try {
      const response = await PostServices.getMyPosts();
      const fetchedPosts = response.data.map(post => ({
        ...post,
        likes: post.likes || [],
        comments: post.comments || [],
        hotnessScore: calculateHotnessScore(post)
      }));
      setUserPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      toast.error("Could not load your posts.");
    } finally {
      setLoadingPosts(false);
    }
  };

  // Component Mount
  useEffect(() => {
    updateUser();
    if (JSON.parse(localStorage.getItem("todoapp"))) {
      fetchUserPosts();
    }
    window.addEventListener("storage", updateUser);
    return () => window.removeEventListener("storage", updateUser);
  }, []);

  // Logout Handler
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("todoapp");
      setCurrentUser(null);
      toast.success("Logged out successfully");
      navigate("/auth");
    }
  };

  // Profile Edit Handlers
  const handleEditProfile = () => setOpenEditProfile(true);
  
  // 🚨 MODIFIED: To save permanently to the backend database
  const handleSaveProfile = async () => {
    if (!currentUser) {
        toast.error("Authentication required to save changes.");
        return;
    }

    setIsSaving(true);
    try {
        // Payload includes all editable profile fields
        const payload = {
            name: editForm.name,
            phone: editForm.phone,
            bio: editForm.bio,
            university: editForm.university,
            major: editForm.major,
            year: editForm.year,
            github: editForm.github,
            linkedin: editForm.linkedin,
        };

        // 1. Send Update Request to Backend (Token is automatically added by api.js)
        const res = await UserServices.updateProfile(payload);
        
        // Assuming your backend returns the fully updated user object under res.data.user
        const updatedUserFromDB = res.data.user;

        // 2. Update LocalStorage with Fresh Data from DB
        const updatedUserLocal = { 
            ...currentUser, 
            ...updatedUserFromDB,
            // Preserve the existing token, as it's often not returned on a PUT request
            token: currentUser.token 
        };
        
        localStorage.setItem("todoapp", JSON.stringify(updatedUserLocal));
        
        // 3. Update Component State
        setCurrentUser(updatedUserLocal);
        setOpenEditProfile(false);
        toast.success("Profile updated permanently! 💾");

    } catch (error) {
        console.error("Error saving profile:", error);
        // Rely on api.js interceptor to show clear error messages or handle 401
        toast.error(error.response?.data?.message || "Failed to save profile changes.");
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleInputChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  
  // Post Interaction Handlers
  const handleLike = async (postId) => {
    if (!currentUser?.token) {
      toast.error("You must be logged in to like a post");
      return;
    }
    try {
      const res = await PostServices.likePost(postId);
      updatePostInState(res.data);
      const likedByUser = isPostLikedByUser(res.data, currentUser._id);
      toast.success(likedByUser ? "Post liked! 👍" : "Post unliked! 👎");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to like/unlike post");
    }
  };

  const handleAddComment = async (postId) => {
    const text = newCommentText[postId]?.trim();
    if (!text) {
      toast.error("Comment cannot be empty.");
      return;
    }
    try {
      const res = await PostServices.addComment(postId, text);
      updatePostInState(res.data);
      setNewCommentText(prev => ({ ...prev, [postId]: "" }));
      toast.success("Comment added! 💬");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add comment.");
    }
  };

  const handleOpenPostDialog = (post) => {
    setSelectedPost(post);
    setPostDialogOpen(true);
  };

  const handleClosePostDialog = () => {
    setPostDialogOpen(false);
    setSelectedPost(null);
  };
  
  const handleViewProfile = (userId) => {
    setPostDialogOpen(false); 
    if (userId) {
      if (userId === currentUser?._id) navigate("/profile");
      else navigate(`/profile-view/${userId}`);
    } else {
      toast.error("User information is unavailable.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await PostServices.deletePost(postId);
      setUserPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      toast.success("Post deleted successfully! 👋");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete post.");
    }
  };

  // Check if user is logged in
  if (!currentUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Please log in to view your profile.</h2>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Vertical Navbar */}
      <VerticalNavbar currentUser={currentUser} onLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <h1 className="page-title">Profile</h1>
          </div>
          <div className="header-right">
            <button onClick={toggleDarkMode} className="dark-mode-toggle">
              {darkMode ? <SunIcon size={20} /> : <MoonIcon size={20} />}
            </button>
            <button className="notification-btn">
              <BellIcon size={20} />
            </button>
            <button className="new-post-btn" onClick={() => navigate("/create-post")}>
              <PlusIcon size={18} />
              New post
            </button>
            <button 
              onClick={handleLogout} 
              className="logout-btn"
              style={{
                backgroundColor: '#ef4444',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
            >
              <LogOutIcon size={18} />
              Logout
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className="content-container profile-container">
          
          {/* Profile Tabs */}
          <div className="profile-tabs">
            <button
              onClick={() => setActiveTab("profile")}
              className={`profile-tab ${activeTab === "profile" ? "active" : ""}`}
            >
              Profile Info
            </button>
            <button
              onClick={() => setActiveTab("my-posts")}
              className={`profile-tab ${activeTab === "my-posts" ? "active" : ""}`}
            >
              My Posts
              <span className="tab-badge">{userPosts.length}</span>
            </button>
          </div>
          
          {/* MY POSTS TAB */}
          {activeTab === "my-posts" && (
            <div>
              <h2 className="posts-section-title">My Contributions</h2>
              {loadingPosts ? (
                <div className="loading-spinner-container">
                  <div className="spinner"></div>
                </div>
              ) : userPosts.length === 0 ? (
                <div className="empty-posts-state">
                  <h3 className="empty-state-title">You haven't posted anything yet!</h3>
                  <p className="empty-state-text">Create a new post to see it appear here.</p>
                </div>
              ) : (
                <div className="posts-grid">
                  {userPosts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      currentUser={currentUser}
                      onOpenDialog={handleOpenPostDialog}
                      onLike={handleLike}
                      onDeletePost={handleDeletePost}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* PROFILE INFO TAB */}
          {activeTab === "profile" && (
            <>
              {/* Profile Header Card */}
              <div className="profile-header-card">
                <div className="profile-header-content">
                  <div className="profile-avatar-large">
                    {currentUser?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-info">
                    <h1 className="profile-name">{currentUser?.name}</h1>
                    {currentUser?.bio && <p className="profile-bio">{currentUser.bio}</p>}
                    <p className="profile-email">{currentUser?.email}</p>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                      <button className="edit-profile-btn" onClick={handleEditProfile}>
                        <EditIcon size={16} />
                        Edit Profile
                      </button>
                      <button 
                        onClick={handleLogout}
                        style={{
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                      >
                        <LogOutIcon size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details Card */}
              <div className="profile-details-card">
                <h2 className="card-title">Profile Information</h2>
                <div className="card-divider"></div>
                
                <div className="details-grid">
                  <div className="detail-item">
                    <EmailIcon className="detail-icon" />
                    <div className="detail-content">
                      <div className="detail-label">Email</div>
                      <div className="detail-value">{currentUser?.email || "Not provided"}</div>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <PhoneIcon className="detail-icon" />
                    <div className="detail-content">
                      <div className="detail-label">Phone</div>
                      <div className="detail-value">{currentUser?.phone || "Not provided"}</div>
                    </div>
                  </div>
                  
                  {currentUser?.university && (
                    <div className="detail-item">
                      <SchoolIcon className="detail-icon" />
                      <div className="detail-content">
                        <div className="detail-label">University</div>
                        <div className="detail-value">{currentUser.university}</div>
                      </div>
                    </div>
                  )}
                  
                  {currentUser?.major && (
                    <div className="detail-item">
                      <WorkIcon className="detail-icon" />
                      <div className="detail-content">
                        <div className="detail-label">Major</div>
                        <div className="detail-value">{currentUser.major}</div>
                      </div>
                    </div>
                  )}
                  
                  {currentUser?.year && (
                    <div className="detail-item">
                      <CalendarIcon className="detail-icon" />
                      <div className="detail-content">
                        <div className="detail-label">Year of Study</div>
                        <div className="detail-value">{currentUser.year}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Links Card */}
              {(currentUser?.github || currentUser?.linkedin) && (
                <div className="social-links-card">
                  <h2 className="card-title">Social Links</h2>
                  <div className="card-divider"></div>
                  <div className="social-links-grid">
                    {currentUser?.github && (
                      <div className="detail-item">
                        <GitHubIcon className="detail-icon" />
                        <div className="detail-content">
                          <div className="detail-label">GitHub</div>
                          <div className="detail-value">
                            <a href={`https://github.com/${currentUser.github}`} target="_blank" rel="noopener noreferrer">
                              @{currentUser.github}
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                    {currentUser?.linkedin && (
                      <div className="detail-item">
                        <LinkedInIcon className="detail-icon" />
                        <div className="detail-content">
                          <div className="detail-label">LinkedIn</div>
                          <div className="detail-value">
                            <a href={`https://linkedin.com/in/${currentUser.linkedin}`} target="_blank" rel="noopener noreferrer">
                              /{currentUser.linkedin}
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      {/* Edit Profile Modal (Updated Save Button) */}
      {openEditProfile && (
        <div className="modal-overlay" onClick={() => setOpenEditProfile(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Profile</h2>
            </div>
            <div className="modal-body">
              <div className="form-field">
                <label className="form-label">Name</label>
                <input name="name" type="text" className="form-input" value={editForm.name} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label className="form-label">Email</label>
                <input name="email" type="email" className="form-input" value={editForm.email} onChange={handleInputChange} disabled />
              </div>
              <div className="form-field">
                <label className="form-label">Phone</label>
                <input name="phone" type="text" className="form-input" value={editForm.phone} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label className="form-label">Bio</label>
                <textarea name="bio" className="form-input form-textarea" value={editForm.bio} onChange={handleInputChange} rows={3} />
              </div>
              <div className="form-field">
                <label className="form-label">University</label>
                <input name="university" type="text" className="form-input" value={editForm.university} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label className="form-label">Major</label>
                <input name="major" type="text" className="form-input" value={editForm.major} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label className="form-label">Year of Study</label>
                <input name="year" type="text" className="form-input" value={editForm.year} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label className="form-label">GitHub Username</label>
                <input name="github" type="text" className="form-input" value={editForm.github} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label className="form-label">LinkedIn Profile</label>
                <input name="linkedin" type="text" className="form-input" value={editForm.linkedin} onChange={handleInputChange} />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setOpenEditProfile(false)} className="modal-btn modal-btn-cancel" disabled={isSaving}>Cancel</button>
              <button onClick={handleSaveProfile} className="modal-btn modal-btn-save" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Post Dialog */}
      <FullPostDialog
        open={postDialogOpen}
        post={selectedPost}
        onClose={handleClosePostDialog}
        user={currentUser}
        onLike={handleLike}
        onAddComment={handleAddComment}
        onNavigateProfile={handleViewProfile}
        newCommentText={newCommentText}
        setNewCommentText={setNewCommentText}
      />
    </div>
  );
};

export default Profile;