import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PostServices from "../Services/PostServices";
import toast from "react-hot-toast";
import {
  Home as HomeIcon,
  TrendingUp as LeaderboardIcon,
  User as PersonIcon,
  LogOut as LogoutIcon,
  ThumbsUp as ThumbUpIcon,
  MessageCircle as ChatBubbleIcon,
  X as CloseIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Bell as BellIcon,
  Plus as PlusIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "../styles/navbar.css";
import "../styles/home.css";

const SPECIALIZATIONS = [
  { value: 'all', label: 'All Projects', icon: '🌟' },
  { value: 'web-dev', label: 'Web Dev', icon: '🌐' },
  { value: 'mobile-dev', label: 'Mobile Dev', icon: '📱' },
  { value: 'ai-ml', label: 'AI/ML', icon: '🤖' },
  { value: 'data-science', label: 'Data Science', icon: '📊' },
  { value: 'cloud-computing', label: 'Cloud', icon: '☁️' },
  { value: 'devops', label: 'DevOps', icon: '⚙️' },
  { value: 'cybersecurity', label: 'Security', icon: '🔒' },
  { value: 'blockchain', label: 'Blockchain', icon: '⛓️' },
  { value: 'game-dev', label: 'Game Dev', icon: '🎮' },
  { value: 'iot', label: 'IoT', icon: '🔌' },
  { value: 'ui-ux', label: 'UI/UX', icon: '🎨' },
  { value: 'other', label: 'Other', icon: '💡' },
];

const getSpecLabel = (specValue) => {
  const spec = SPECIALIZATIONS.find(s => s.value === specValue);
  return spec ? `${spec.icon} ${spec.label}` : specValue;
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const MINUTE = 60;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY;

  if (seconds < MINUTE) return `${seconds}s ago`;
  if (seconds < HOUR) return `${Math.floor(seconds / MINUTE)}m ago`;
  if (seconds < DAY) return `${Math.floor(seconds / HOUR)}h ago`;
  if (seconds < WEEK) return `${Math.floor(seconds / DAY)}d ago`;
  if (seconds < MONTH) return `${Math.floor(seconds / WEEK)}w ago`;
  
  const formatter = new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });

  return formatter.format(date);
};

const renderClickableText = (text) => {
  const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  if (!text) return null;

  const parts = [];
  let lastIndex = 0;
  
  text.replace(urlRegex, (match, url, offset) => {
    if (offset > lastIndex) {
      parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, offset)}</span>);
    }
    
    parts.push(
      <a 
        key={`link-${offset}`} 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ color: '#0f766e', textDecoration: 'underline', wordBreak: 'break-all' }} 
        onClick={(e) => e.stopPropagation()} 
      >
        {url}
      </a>
    );
    
    lastIndex = offset + match.length;
  });

  if (lastIndex < text.length) {
    parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
  }

  return parts;
};

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("home");
  const [selectedSpec, setSelectedSpec] = useState("all");
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();

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

  const updateUser = () => {
    const user = JSON.parse(localStorage.getItem("todoapp"));
    setCurrentUser(user);
  };

  useEffect(() => {
    updateUser();
    fetchPosts();
    window.addEventListener("storage", updateUser);
    return () => window.removeEventListener("storage", updateUser);
  }, []);

  useEffect(() => {
    if (selectedSpec === "all") {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(post => post.specialization === selectedSpec));
    }
  }, [selectedSpec, posts]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await PostServices.getAllPosts(); 
      setPosts(res.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("todoapp");
    setCurrentUser(null);
    setPosts([]);
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const updatePostInState = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => 
        post._id === updatedPost._id ? updatedPost : post
      )
    );
    if (selectedPost && selectedPost._id === updatedPost._id) {
      setSelectedPost(updatedPost);
    }
  };

  const handleLike = async (postId) => {
    if (!currentUser?.token) {
      toast.error("You must be logged in to like a post");
      navigate("/auth");
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

  const handleAddComment = useCallback(async (postId, text) => {
    const trimmedText = text?.trim();
    if (!trimmedText) {
      toast.error("Comment cannot be empty.");
      return false;
    }
    if (!currentUser?.token) {
      toast.error("You must be logged in to comment.");
      navigate("/auth");
      return false;
    }

    try {
      const res = await PostServices.addComment(postId, trimmedText);
      updatePostInState(res.data);
      toast.success("Comment added! 💬");
      return true;

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add comment.");
      return false;
    }
  }, [currentUser, navigate]);

  const isPostLikedByUser = (post, userId) => {
    if (!post || !post.likes || !userId) return false;
    
    return post.likes.some((like) => {
      if (!like || !like.user) return false;
      const likeUserId = typeof like.user === 'object' ? like.user._id : like.user;
      return String(likeUserId) === String(userId);
    });
  };

  const handleNavClick = (navItem) => {
    setActiveNav(navItem);
    if (navItem === "home") navigate("/home");
    else if (navItem === "leaderboard") navigate("/leaderboard");
    else if (navItem === "profile") navigate("/profile");
  };

  const handleViewProfile = (userId) => {
    setPostDialogOpen(false); 
    if (userId) {
      if (userId === currentUser?._id) {
        navigate("/profile");
      } else {
        navigate(`/profile-view/${userId}`);
      }
    } else {
      toast.error("User information is unavailable.");
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

  const FullPostDialog = ({ open, post, onClose, user, onLike, onAddComment, onNavigateProfile }) => {
    const [dialogCommentText, setDialogCommentText] = useState(""); 

    useEffect(() => {
      if (open && post?._id) {
        setDialogCommentText("");
      }
    }, [open, post?._id]);

    const handleLocalAddComment = async () => {
      const success = await onAddComment(post._id, dialogCommentText); 
      if (success) {
        setDialogCommentText("");
      }
    }

    if (!post) return null;

    const likedByUser = isPostLikedByUser(post, user?._id);
    const postUser = post.user;
    const postUserId = postUser?._id;
    const postUserName = postUser?.name || "Unknown";
    const relativeTime = formatRelativeTime(post.createdAt);
    
    const mediaUrl = post.media?.url || post.image || '';
    const mediaType = post.media?.type || (post.image ? 'image' : 'none');
    const hasMedia = mediaUrl && mediaType !== 'none';

    if (!open) return null;

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
            <div style={{ flex: '2', padding: '24px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', cursor: 'pointer' }}
                onClick={() => onNavigateProfile(postUserId)}>
                <div className="author-avatar">
                  {postUserName.charAt(0).toUpperCase()}
                </div>
                <div style={{ marginLeft: '12px' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{postUserName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Posted: {relativeTime}</div>
                </div>
              </div>
              
              {hasMedia && (
                <div style={{ marginBottom: '16px' }}>
                  {mediaType === 'video' ? (
                    <video 
                      src={mediaUrl}
                      controls
                      style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', backgroundColor: 'black', borderRadius: '8px' }}
                    />
                  ) : (
                    <img 
                      src={mediaUrl} 
                      alt={post.title}
                      style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px' }}
                    />
                  )}
                </div>
              )}
              
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {renderClickableText(post.description)}
              </div>
            </div>
            
            <div style={{ flex: '1', padding: '24px', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', maxHeight: '70vh' }}>
              <h3 style={{ marginBottom: '16px' }}>Interactions</h3>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button
                  onClick={() => onLike(post._id)}
                  className={`stat-btn ${likedByUser ? 'liked' : ''}`}
                  disabled={!user?.token}
                >
                  <ThumbUpIcon size={16} />
                  {post.likes.length}
                </button>
                <div className="stat-item">
                  <ChatBubbleIcon size={16} />
                  {post.comments.length}
                </div>
              </div>

              {user?.token && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={dialogCommentText}
                    onChange={(e) => setDialogCommentText(e.target.value)}
                    className="form-input"
                    style={{ flex: 1, padding: '8px' }}
                  />
                  <button 
                    onClick={handleLocalAddComment}
                    className="modal-btn modal-btn-save"
                    style={{ padding: '8px 16px' }}
                  >
                    Post
                  </button>
                </div>
              )}

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {post.comments.length > 0 ? (
                  post.comments.slice().reverse().map((comment, i) => ( 
                    <div key={comment._id || i} style={{ marginBottom: '12px', padding: '12px', backgroundColor: 'var(--nav-active)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                        <div className="comment-avatar">
                          {comment.user?.name ? comment.user.name[0] : 'A'}
                        </div>
                        <span style={{ fontWeight: 'bold', fontSize: '14px', marginLeft: '8px' }}>
                          {comment.user?.name || "Anonymous"}
                        </span>
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                        {comment.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '16px' }}>
                    No comments yet. Start the conversation!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">C</div>
          <span className="sidebar-logo-text">Connectiva</span>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeNav === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick('home')}
          >
            <HomeIcon size={20} />
            <span>Home</span>
          </button>
          <button 
            className={`nav-item ${activeNav === 'leaderboard' ? 'active' : ''}`}
            onClick={() => handleNavClick('leaderboard')}
          >
            <LeaderboardIcon size={20} />
            <span>Leader Board</span>
          </button>
          <button 
            className={`nav-item ${activeNav === 'profile' ? 'active' : ''}`}
            onClick={() => handleNavClick('profile')}
          >
            <PersonIcon size={20} />
            <span>Explore</span>
          </button>
        </nav>

        {currentUser && (
          <div className="sidebar-user">
            <div className="user-avatar">
              {currentUser.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{currentUser.name}</div>
              <div className="user-email">{currentUser.email}</div>
            </div>
            <button onClick={handleLogout} className="logout-btn" title="Logout">
              <LogoutIcon size={18} />
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div className="header-left">
            <h1 className="page-title">Today Jun 28</h1>
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
          </div>
        </header>

        <div className="content-container">
          {/* Week Navigation */}
          <div className="week-navigation">
            <button className="week-nav-arrow">
              <ChevronLeft size={18} />
            </button>
            <span className="week-nav-item">28</span>
            <span className="week-nav-item">June 22-28</span>
            <span className="week-nav-item active">June 22-28</span>
            <span className="week-nav-item">June 22-28</span>
            <span className="week-nav-item">June 22-28</span>
            <span className="week-nav-item">June 22-28</span>
            <button className="week-nav-arrow">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Section Header */}
          <div className="section-header">
            <div>
              <h2 className="section-title">
                Best of Week 24
                <span className="section-subtitle">June 22-28</span>
              </h2>
            </div>
            <div className="voting-timer">
              <div className="voting-timer-label">Voting ends in</div>
              <div className="timer-display">
                <div className="timer-unit">
                  <span className="timer-value">02</span>
                  <span className="timer-label">Days</span>
                </div>
                <div className="timer-unit">
                  <span className="timer-value">14</span>
                  <span className="timer-label">Hrs</span>
                </div>
                <div className="timer-unit">
                  <span className="timer-value">56</span>
                  <span className="timer-label">Mins</span>
                </div>
              </div>
            </div>
          </div>

          {/* Posts List */}
          <div className="posts-list">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <h3 className="empty-state-title">No posts available yet</h3>
                <p className="empty-state-text">Be the first to create one!</p>
              </div>
            ) : (
              filteredPosts.map((post, index) => {
                const postUser = post.user;
                const postUserName = postUser?.name || "Unknown";
                const mediaUrl = post.media?.url || post.image || '';
                const relativeTime = formatRelativeTime(post.createdAt);
                
                return (
                  <div key={post._id} className="post-card" onClick={() => handleOpenPostDialog(post)}>
                    <div className="post-layout">
                      <div className={`post-rank ${index < 3 ? `rank-${index + 1}` : ''}`}>
                        #{index + 1}
                      </div>
                      
                      {mediaUrl && (
                        <div className="post-image-container">
                          <img src={mediaUrl} alt={post.title} className="post-image" />
                        </div>
                      )}
                      
                      <div className="post-content">
                        <div className="post-header">
                          <div>
                            <h3 className="post-title">{post.title}</h3>
                            {post.specialization && (
                              <span className="spec-badge">
                                {getSpecLabel(post.specialization).split(' ').slice(1).join(' ')}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="post-description">{post.description}</p>
                        
                        <div className="post-author">
                          <div className="author-avatar">
                            {postUserName.charAt(0).toUpperCase()}
                          </div>
                          <div className="author-info">
                            <div className="author-name">{postUserName}</div>
                            <div className="author-role">React Developer at Figma</div>
                          </div>
                          <button className="follow-btn">Follow</button>
                        </div>
                        
                        <div className="post-stats">
                          <div className={`stat-item ${isPostLikedByUser(post, currentUser?._id) ? 'liked' : ''}`}>
                            <ThumbUpIcon size={18} />
                            <span>{post.likes.length}</span>
                          </div>
                          <div className="stat-item">
                            <ChatBubbleIcon size={18} />
                            <span>{post.comments.length}</span>
                          </div>
                          <span className="post-time">{relativeTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      <FullPostDialog 
        open={postDialogOpen}
        post={selectedPost}
        onClose={handleClosePostDialog}
        user={currentUser}
        onLike={handleLike}
        onAddComment={handleAddComment}
        onNavigateProfile={handleViewProfile}
      />
    </div>
  );
};

export default Home;