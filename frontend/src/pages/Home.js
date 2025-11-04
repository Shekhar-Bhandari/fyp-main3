import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PostServices from "../Services/PostServices";
import toast from "react-hot-toast";
import VerticalNavbar from "../components/VerticalNavbar";
import {
  ThumbsUp as ThumbUpIcon,
  MessageCircle as ChatBubbleIcon,
  X as CloseIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Bell as BellIcon,
  Plus as PlusIcon,
  ChevronLeft,
  ChevronRight,
  Eye as EyeIcon,
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

const getWeekRange = (weekOffset = 0) => {
  const now = new Date();
  // Adjust to make Monday the start of the week (1=Mon, 0=Sun)
  const currentDay = now.getDay();
  const diff = currentDay === 0 ? 6 : currentDay - 1; // 0=Sun becomes 6, 1=Mon becomes 0
  
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - diff - (weekOffset * 7));
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  return { weekStart, weekEnd };
};

const formatWeekRange = (weekStart, weekEnd) => {
  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
  const startDay = weekStart.getDate();
  const endDay = weekEnd.getDate();
  const startYear = weekStart.getFullYear();
  const endYear = weekEnd.getFullYear();

  let yearDisplay = '';
  if (startYear !== endYear || startYear !== new Date().getFullYear()) {
    yearDisplay = ` ${startYear}`;
  }
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}${yearDisplay}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}${yearDisplay}`;
};

const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// --- Ranking Algorithm Helpers and Constants ---

const W_L = 5.0; // Weight for Likes
const W_C = 3.0; // Weight for Unique Commenters
const W_V = 1.0; // Weight for Views
const GRAVITY = 0.1; // ADJUSTED: Very low gravity for Engagement-First ranking

const getUniqueCommenters = (post) => {
  if (!post.comments || post.comments.length === 0) return 0;
  
  const uniqueUserIds = new Set();
  post.comments.forEach(comment => {
    // Assuming comment.user is either an object { _id: '...' } or a string '...'
    const userId = typeof comment.user === 'object' ? comment.user._id : comment.user;
    if (userId) {
      uniqueUserIds.add(String(userId));
    }
  });
  return uniqueUserIds.size;
};

const getMostRecentActionTime = (post) => {
  let latestTime = post.createdAt ? new Date(post.createdAt).getTime() : 0;
  
  // Check likes
  if (post.likes && post.likes.length > 0) {
    post.likes.forEach(like => {
      if (like.createdAt) {
        latestTime = Math.max(latestTime, new Date(like.createdAt).getTime());
      }
    });
  }
  
  // Check comments
  if (post.comments && post.comments.length > 0) {
    post.comments.forEach(comment => {
      if (comment.createdAt) {
        latestTime = Math.max(latestTime, new Date(comment.createdAt).getTime());
      }
    });
  }
  
  return latestTime;
};

// FULL WEEKLY COMPOSITE RANKING ALGORITHM
const rankPosts = (posts) => {
  const now = Date.now();
  
  // Calculate scores for all posts first
  const scoredPosts = posts.map(post => {
    // --- Calculate Score ---
    const views = post.views?.length || 0;
    const likes = post.likes?.length || 0;
    const uniqueCommenters = getUniqueCommenters(post);
    
    // Engagement Score (Numerator): Logarithmic Scaling + Weights
    const engagementScore = 
      (W_L * Math.log10(likes + 1)) + 
      (W_C * Math.log10(uniqueCommenters + 1)) + 
      (W_V * Math.log10(views + 1));
      
    // Time Decay Factor (Denominator)
    const recentTime = getMostRecentActionTime(post);
    // Hours since last action (ensures non-negative time)
    const hoursSinceAction = Math.max(0, (now - recentTime) / (1000 * 60 * 60)); 
    
    // If GRAVITY is 0.1, the decay is minimal, keeping the score close to the raw engagement
    const timeDecayFactor = Math.pow((hoursSinceAction + 2), GRAVITY);
    
    // Final Weekly Score
    const score = engagementScore / timeDecayFactor;

    return { post, score, engagementScore };
  });


  // Sort descending (highest score first)
  return scoredPosts.sort((a, b) => b.score - a.score).map(item => item.post);
};

// --- End of Ranking Algorithm ---

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSpec, setSelectedSpec] = useState("all");
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);
  const [availableWeeks, setAvailableWeeks] = useState([]);
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
    if (posts.length > 0) {
      const weeks = new Set();
      const now = new Date();
      
      // Determine all unique week offsets present in the data
      posts.forEach(post => {
        const postDate = new Date(post.createdAt);
        // Calculate diff based on current week structure (Mon start)
        const currentDay = now.getDay();
        const diff = currentDay === 0 ? 6 : currentDay - 1; 
        
        const currentWeekStart = new Date(now);
        currentWeekStart.setDate(now.getDate() - diff);
        currentWeekStart.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((currentWeekStart - postDate) / (1000 * 60 * 60 * 24));
        // Use integer division to get the week offset relative to the current week
        const weekOffset = Math.ceil(daysDiff / 7);
        weeks.add(weekOffset);
      });
      
      // Include the current week (offset 0) even if no posts are from this week yet
      weeks.add(0); 

      // Sort weeks from newest (0) to oldest
      const sortedWeeks = Array.from(weeks).sort((a, b) => a - b);
      setAvailableWeeks(sortedWeeks);
    }
  }, [posts]);

  useEffect(() => {
    const { weekStart, weekEnd } = getWeekRange(selectedWeekOffset);
    
    let filtered = posts.filter(post => {
      const postDate = new Date(post.createdAt);
      // Filter by the week range selected
      return postDate >= weekStart && postDate <= weekEnd;
    });
    
    if (selectedSpec !== "all") {
      filtered = filtered.filter(post => post.specialization === selectedSpec);
    }
    
    // Apply the new composite ranking algorithm
    const ranked = rankPosts([...filtered]);
    const top10 = ranked.slice(0, 10);
    
    setFilteredPosts(top10);
  }, [selectedSpec, selectedWeekOffset, posts]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Assuming getAllPosts now fetches posts with aggregated data (likes, comments, views)
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

  const handleView = async (postId) => {
    if (!currentUser?.token) return;

    try {
      // Assuming PostServices.viewPost records the view and returns the updated post
      const res = await PostServices.viewPost(postId);
      updatePostInState(res.data);
    } catch (error) {
      console.error("Error recording view:", error);
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
      // Rate limiting or anti-spam errors from the backend would show here
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

  const handleOpenPostDialog = (post) => {
    setSelectedPost(post);
    setPostDialogOpen(true);
    // Record view when dialog opens
    if (currentUser?.token) {
      handleView(post._id);
    }
  };

  const handleClosePostDialog = () => {
    setPostDialogOpen(false);
    setSelectedPost(null);
  };

  const handlePreviousWeek = () => {
    // Show older weeks (increase offset)
    setSelectedWeekOffset(prev => prev + 1);
  };

  const handleNextWeek = () => {
    // Show newer weeks (decrease offset)
    if (selectedWeekOffset > 0) {
      setSelectedWeekOffset(prev => prev - 1);
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
                  // Display comments newest first
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
  const weekNumber = getWeekNumber(weekStart);
  const weekRangeDisplay = formatWeekRange(weekStart, weekEnd);

  return (
    <div className="app-container">
      <VerticalNavbar currentUser={currentUser} onLogout={handleLogout} />

      <main className="main-content">
        <header className="top-header">
          <div className="header-left">
            <h1 className="page-title">Best of Week {weekNumber}</h1>
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
          <div style={{ 
            marginBottom: '24px', 
            padding: '16px 0',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <button
                onClick={handlePreviousWeek}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--card-bg)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)'
                }}
              >
                <ChevronLeft size={20} />
              </button>

              <div style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                padding: '4px',
                maxWidth: '600px'
              }}>
                {/* Render buttons for available weeks */}
                {availableWeeks.map(weekOffset => {
                  const { weekStart: wStart, weekEnd: wEnd } = getWeekRange(weekOffset);
                  const isSelected = weekOffset === selectedWeekOffset;
                  const range = formatWeekRange(wStart, wEnd);
                  
                  return (
                    <button
                      key={weekOffset}
                      onClick={() => setSelectedWeekOffset(weekOffset)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--card-bg)',
                        color: isSelected ? 'var(--primary-color)' : 'var(--text-primary)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        fontSize: '14px',
                        fontWeight: isSelected ? 'bold' : 'normal',
                        transition: 'all 0.2s'
                      }}
                    >
                      {range}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNextWeek}
                disabled={selectedWeekOffset === 0}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: selectedWeekOffset === 0 ? 'var(--bg-secondary)' : 'var(--card-bg)',
                  cursor: selectedWeekOffset === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: selectedWeekOffset === 0 ? 'var(--text-secondary)' : 'var(--text-primary)',
                  opacity: selectedWeekOffset === 0 ? 0.5 : 1
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
              {weekRangeDisplay}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {selectedSpec === 'all' ? '🏆 Top 10 All Projects' : `🏆 Top 10 ${SPECIALIZATIONS.find(s => s.value === selectedSpec)?.label}`}
              </h2>
              <select
                value={selectedSpec}
                onChange={(e) => setSelectedSpec(e.target.value)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec.value} value={spec.value}>
                    {spec.icon} {spec.label}
                  </option>
                ))}
              </select>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Ranked by **Engagement Score** with minimal time decay only for tie-breaking • Showing {filteredPosts.length} posts
            </p>
          </div>

          <div className="posts-list">
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
              filteredPosts.map((post, index) => {
                const postUser = post.user;
                const postUserName = postUser?.name || "Unknown";
                const mediaUrl = post.media?.url || post.image || '';
                const relativeTime = formatRelativeTime(post.createdAt);
                const isLiked = isPostLikedByUser(post, currentUser?._id);
                
                return (
                  <div key={post._id} className="post-card" onClick={() => handleOpenPostDialog(post)}>
                    <div className="post-layout">
                      <div className={`post-rank ${index < 3 ? `rank-${index + 1}` : ''}`}>
                        #{index + 1}
                      </div>
                      
                      {mediaUrl && (
                        <div className="post-image-container">
                          {/* Display image/video thumbnail */}
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(post._id);
                            }}
                            disabled={!currentUser?.token}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '6px',
                              color: 'var(--text-secondary)',
                              fontSize: '14px',
                              fontWeight: '500',
                              cursor: currentUser?.token ? 'pointer' : 'not-allowed',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--nav-active)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <ThumbUpIcon 
                              size={16} 
                              fill={isLiked ? '#10b981' : 'none'}
                              stroke={isLiked ? '#10b981' : 'currentColor'}
                              style={{ transition: 'all 0.2s' }}
                            />
                            <span style={{ color: isLiked ? '#10b981' : 'var(--text-secondary)' }}>
                              {post.likes.length}
                            </span>
                          </button>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            color: 'var(--text-secondary)',
                            fontSize: '14px'
                          }}>
                            <ChatBubbleIcon size={16} />
                            <span>{post.comments.length}</span>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            color: 'var(--text-secondary)',
                            fontSize: '14px'
                          }}>
                            <EyeIcon size={16} />
                            <span>{post.views?.length || 0}</span>
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