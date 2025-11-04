import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PostServices from "../Services/PostServices";
import toast from "react-hot-toast";
import VerticalNavbar from "../components/VerticalNavbar";
import {
  Sun as SunIcon,
  Moon as MoonIcon,
  Bell as BellIcon,
  Plus as PlusIcon,
  ChevronLeft,
  ChevronRight,
  ThumbsUp as ThumbUpIcon,
  MessageCircle as ChatBubbleIcon,
  X as CloseIcon,
} from "lucide-react";
import "../styles/navbar.css";
import "../styles/explore.css";

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

// Get week start and end dates
const getWeekRange = (weekOffset = 0) => {
  const now = new Date();
  const currentDay = now.getDay();
  const diff = currentDay === 0 ? 6 : currentDay - 1;
  
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - diff - (weekOffset * 7));
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  return { weekStart, weekEnd };
};

// Format week range display
const formatWeekRange = (weekStart, weekEnd) => {
  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
  const startDay = weekStart.getDate();
  const endDay = weekEnd.getDate();
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}`;
  }
  return `${startMonth} ${startDay}-${endMonth} ${endDay}`;
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

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSpec, setSelectedSpec] = useState("all");
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

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

  // Calculate available weeks from posts
  useEffect(() => {
    if (posts.length > 0) {
      const weeks = new Set();
      const now = new Date();
      
      posts.forEach(post => {
        const postDate = new Date(post.createdAt);
        const daysDiff = Math.floor((now - postDate) / (1000 * 60 * 60 * 24));
        const weekOffset = Math.floor(daysDiff / 7);
        if (weekOffset >= 0) {
          weeks.add(weekOffset);
        }
      });
      
      const sortedWeeks = Array.from(weeks).sort((a, b) => a - b);
      setAvailableWeeks(sortedWeeks);
    }
  }, [posts]);

  // Filter posts by selected week and specialization
  useEffect(() => {
    const { weekStart, weekEnd } = getWeekRange(selectedWeekOffset);
    
    let filtered = posts.filter(post => {
      const postDate = new Date(post.createdAt);
      return postDate >= weekStart && postDate <= weekEnd;
    });
    
    if (selectedSpec !== "all") {
      filtered = filtered.filter(post => post.specialization === selectedSpec);
    }
    
    setFilteredPosts(filtered);
  }, [selectedSpec, selectedWeekOffset, posts]);

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

  const handlePreviousWeek = () => {
    setSelectedWeekOffset(prev => prev + 1);
  };

  const handleNextWeek = () => {
    if (selectedWeekOffset > 0) {
      setSelectedWeekOffset(prev => prev - 1);
    }
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setPostDialogOpen(true);
  };

  const handleClosePostDialog = () => {
    setPostDialogOpen(false);
    setSelectedPost(null);
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
              
              {post.specialization && (
                <span className="spec-badge" style={{ marginBottom: '16px', display: 'inline-block' }}>
                  {getSpecLabel(post.specialization)}
                </span>
              )}
              
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
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <button
                  onClick={() => onLike(post._id)}
                  disabled={!user?.token}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: user?.token ? 'pointer' : 'not-allowed',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--nav-active)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <ThumbUpIcon 
                    size={18} 
                    fill={likedByUser ? '#10b981' : 'none'}
                    stroke={likedByUser ? '#10b981' : 'currentColor'}
                    style={{ transition: 'all 0.2s' }}
                  />
                  <span style={{ color: likedByUser ? '#10b981' : 'var(--text-secondary)' }}>
                    Like {post.likes.length > 0 && `(${post.likes.length})`}
                  </span>
                </button>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--nav-active)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <ChatBubbleIcon size={18} />
                  <span>Comment {post.comments.length > 0 && `(${post.comments.length})`}</span>
                </button>
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

  const { weekStart, weekEnd } = getWeekRange(selectedWeekOffset);
  const weekRangeDisplay = formatWeekRange(weekStart, weekEnd);
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="app-container">
      <VerticalNavbar currentUser={currentUser} onLogout={handleLogout} />

      <main className="main-content">
        <header className="top-header">
          <div className="header-left">
            <h1 className="page-title">Today {currentDate}</h1>
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

        <div className="explore-container">
          {/* Week Selector */}
          <div className="week-selector-container">
            <button onClick={handlePreviousWeek} className="week-nav-btn">
              <ChevronLeft size={20} />
            </button>

            <div className="week-buttons-wrapper">
              {availableWeeks.map(weekOffset => {
                const { weekStart: wStart, weekEnd: wEnd } = getWeekRange(weekOffset);
                const isSelected = weekOffset === selectedWeekOffset;
                const range = formatWeekRange(wStart, wEnd);
                
                return (
                  <button
                    key={weekOffset}
                    onClick={() => setSelectedWeekOffset(weekOffset)}
                    className={`week-btn ${isSelected ? 'selected' : ''}`}
                  >
                    {range}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={handleNextWeek} 
              disabled={selectedWeekOffset === 0}
              className="week-nav-btn"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Page Title */}
          <div className="explore-header">
            <h1 className="explore-title">
              All of this week <span className="week-range">{weekRangeDisplay}</span>
            </h1>
          </div>

          {/* Specialization Filter */}
          <div className="filter-tabs">
            {SPECIALIZATIONS.map((spec) => (
              <button
                key={spec.value}
                onClick={() => setSelectedSpec(spec.value)}
                className={`filter-tab ${selectedSpec === spec.value ? 'active' : ''}`}
              >
                <span style={{ marginRight: '4px' }}>{spec.icon}</span>
                {spec.label}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3 className="empty-state-title">No posts for this week</h3>
              <p className="empty-state-text">Try selecting a different week or category!</p>
            </div>
          ) : (
            <div className="posts-grid">
              {filteredPosts.map((post) => {
                const mediaUrl = post.media?.url || post.image || '';
                const isLiked = isPostLikedByUser(post, currentUser?._id);
                
                return (
                  <div 
                    key={post._id} 
                    className="explore-card"
                    onClick={() => handlePostClick(post)}
                  >
                    <div className="explore-card-image">
                      {mediaUrl && (
                        <img src={mediaUrl} alt={post.title} />
                      )}
                      <div className="explore-card-overlay">
                        <div className="like-badge" style={{
                          backgroundColor: isLiked ? '#10b981' : 'rgba(0, 0, 0, 0.6)',
                          color: 'white'
                        }}>
                          <ThumbUpIcon 
                            size={14} 
                            fill={isLiked ? 'white' : 'none'}
                          />
                          <span>{post.likes?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className="explore-card-content">
                      <h3 className="explore-card-title">{post.title}</h3>
                      {post.specialization && (
                        <span className="spec-badge-small">
                          {getSpecLabel(post.specialization)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

export default Explore;