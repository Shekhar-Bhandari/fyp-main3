import React, { useEffect, useState } from "react";
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
  Trophy,
  Award,
  Medal,
} from "lucide-react";
import "../styles/navbar.css";
import "../styles/leaderboard.css";

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

const getSpecName = (specValue) => {
  const spec = SPECIALIZATIONS.find(s => s.value === specValue);
  return spec ? spec.label : specValue;
};

const calculateDecayScore = (post) => {
  return post.likes?.length || 0;
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = Math.floor(seconds / 31536000); 
  if (interval >= 1) {
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  interval = Math.floor(seconds / 2592000); 
  if (interval >= 1) {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  interval = Math.floor(seconds / 86400); 
  if (interval >= 1) {
    if (interval === 1) return 'yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); 
  }

  interval = Math.floor(seconds / 3600); 
  if (interval >= 1) {
    return interval + (interval === 1 ? ' hour ago' : ' hours ago');
  }

  interval = Math.floor(seconds / 60); 
  if (interval >= 1) {
    return interval + (interval === 1 ? ' minute ago' : ' minutes ago');
  }

  if (seconds < 5) return 'just now';
  return Math.floor(seconds) + ' seconds ago';
};

const renderDescriptionWithLinks = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a 
          key={index} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const PostDetailDialog = ({ open, handleClose, post }) => {
  if (!post || !open) return null;

  const mediaUrl = post.media?.url || post.image || '';
  const isVideo = post.media?.type === 'video';
  const postRank = post.rank !== undefined ? post.rank : 'N/A';
  const likeScore = post.decayScore?.toFixed(0) || 'N/A';

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="modal-title">{post.title}</h2>
          <button onClick={handleClose} className="post-action-btn">
            <CloseIcon size={20} />
          </button>
        </div>
        
        <div className="modal-body" style={{ padding: 0 }}>
          {mediaUrl && (
            <div style={{ width: '100%', backgroundColor: 'black' }}>
              {isVideo ? (
                <video 
                  src={mediaUrl} 
                  controls 
                  autoPlay 
                  loop
                  style={{ width: '100%', maxHeight: 600, objectFit: 'contain' }}
                />
              ) : (
                <img 
                  src={mediaUrl} 
                  alt={post.title} 
                  style={{ width: '100%', height: 400, objectFit: 'contain' }}
                />
              )}
            </div>
          )}
          
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="author-avatar">
                  {post.user?.name ? post.user.name[0] : 'U'}
                </div>
                <span style={{ fontWeight: 'bold' }}>{post.user?.name || "Unknown User"}</span>
              </div>
              <span className="spec-badge">{getSpecName(post.specialization)}</span>
            </div>

            <p style={{ whiteSpace: 'pre-wrap', marginBottom: '16px', lineHeight: '1.6' }}>
              {renderDescriptionWithLinks(post.description)}
            </p>

            <div style={{ display: 'flex', gap: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
              <span>
                <ThumbUpIcon size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                {post.likes.length} Likes
              </span>
              <span>
                <ChatBubbleIcon size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                {post.comments.length} Comments
              </span>
              <span style={{ marginLeft: 'auto', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                Rank: #{postRank + 1} | Likes: {likeScore}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Leaderboard = () => {
  const [topPosts, setTopPosts] = useState([]); 
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [specializationFilter, setSpecializationFilter] = useState("all"); 
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [newCommentText, setNewCommentText] = useState({}); 
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    fetchTopPosts(specializationFilter === 'all' ? '' : specializationFilter);
    
    const intervalId = setInterval(() => {
      fetchTopPosts(specializationFilter === 'all' ? '' : specializationFilter);
    }, 60000);

    window.addEventListener("storage", updateUser);
    return () => {
      window.removeEventListener("storage", updateUser);
      clearInterval(intervalId);
    }
  }, [specializationFilter]); 

  const fetchTopPosts = async (specialization = "") => {
    try {
      setLoading(true);
      const res = await PostServices.getAllPosts(specialization); 

      let postsWithScores = res.data.map(post => ({
        ...post,
        decayScore: calculateDecayScore(post)
      }));

      const sortedPosts = postsWithScores.sort((a, b) => b.decayScore - a.decayScore);
      const top10 = sortedPosts.slice(0, 10).map((post, index) => ({
        ...post,
        rank: index
      }));
      
      setTopPosts(top10);
      
    } catch (error) {
      console.error("Error fetching top posts:", error);
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (post) => {
    setSelectedPost(post);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPost(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("todoapp");
    setCurrentUser(null);
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const handleLike = async (postId) => {
    if (!currentUser?.token) {
      toast.error("You must be logged in to like a post");
      navigate("/auth");
      return;
    }

    try {
      const res = await PostServices.likePost(postId);
      const updatedPost = res.data;

      setTopPosts((prevPosts) => {
        const updated = prevPosts.map((post) =>
          post._id === updatedPost._id ? { ...updatedPost, decayScore: calculateDecayScore(updatedPost), rank: post.rank } : post
        );
        const reRanked = updated.sort((a, b) => b.decayScore - a.decayScore).map((post, index) => ({...post, rank: index}));
        return reRanked;
      });
      
      if (selectedPost && selectedPost._id === updatedPost._id) {
        setSelectedPost(prev => ({ 
          ...prev, 
          ...updatedPost, 
          decayScore: calculateDecayScore(updatedPost) 
        }));
      }

      const likedByUser = updatedPost.likes.some(
        (like) => (like.user?._id || like.user) === currentUser?._id
      );
      toast.success(likedByUser ? "Post liked!" : "Post unliked!");
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
    if (!currentUser?.token) {
      toast.error("You must be logged in to comment.");
      navigate("/auth");
      return;
    }

    try {
      const res = await PostServices.addComment(postId, text);
      const updatedPost = res.data; 

      setTopPosts((prevPosts) => {
        const updated = prevPosts.map((post) =>
          post._id === updatedPost._id ? { ...updatedPost, decayScore: calculateDecayScore(updatedPost), rank: post.rank } : post
        );
        const reRanked = updated.sort((a, b) => b.decayScore - a.decayScore).map((post, index) => ({...post, rank: index}));
        return reRanked;
      });
      
      if (selectedPost && selectedPost._id === updatedPost._id) {
        setSelectedPost(prev => ({ 
          ...prev, 
          ...updatedPost, 
          decayScore: calculateDecayScore(updatedPost) 
        }));
      }

      setNewCommentText(prev => ({ ...prev, [postId]: "" }));
      toast.success("Comment added!");

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add comment.");
    }
  };
  
  const handleToggleComments = (postId) => {
    setExpandedPostId(prevId => (prevId === postId ? null : postId));
  };

  const handleViewProfile = (userId) => {
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

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy size={24} />;
    if (index === 1) return <Award size={24} />;
    if (index === 2) return <Medal size={24} />;
    return `#${index + 1}`;
  };

  return (
    <div className="app-container">
      {/* Vertical Navbar */}
      <VerticalNavbar currentUser={currentUser} onLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <h1 className="page-title">Leaderboard</h1>
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

        {/* Content Container */}
        <div className="content-container">
          {/* Leaderboard Header */}
          <div className="leaderboard-header">
            <h2 className="leaderboard-title">
              <Trophy size={36} style={{ color: '#ffd700' }} />
              All-Time Popularity Leaderboard
            </h2>
            <p className="leaderboard-subtitle">
              Ranks posts based purely on the Total Number of Likes
            </p>
          </div>

          {/* Filter Section */}
          <div className="filter-section">
            <select
              className="filter-dropdown"
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
            >
              {SPECIALIZATIONS.map((spec) => (
                <option key={spec.value} value={spec.value}>
                  {spec.icon} {spec.label}
                </option>
              ))}
            </select>
          </div>

          {/* Leaderboard Posts Container */}
          <div className="leaderboard-container">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
              </div>
            ) : topPosts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏆</div>
                <h3 className="empty-state-title">No posts yet</h3>
                <p className="empty-state-text">Be the first to post in this category!</p>
              </div>
            ) : (
              topPosts.map((post, index) => {
                const likedByUser = post.likes.some(
                  (like) => (like.user?._id || like.user) === currentUser?._id
                );
                const isExpanded = expandedPostId === post._id; 
                const postUser = post.user;
                const postUserId = postUser?._id;
                const postUserName = postUser?.name || "Unknown";
                const timeAgo = formatTimeAgo(post.createdAt);
                const totalLikes = post.decayScore?.toFixed(0) || '0';
                const mediaUrl = post.media?.url || post.image || '';

                return (
                  <div 
                    key={post._id} 
                    className={`leaderboard-item ${index < 3 ? `rank-${index + 1}` : 'rank-other'}`}
                  >
                    {/* Rank Badge */}
                    <div className={`rank-badge ${index < 3 ? `rank-${index + 1}` : 'rank-other'}`}>
                      {getRankIcon(index)}
                    </div>
                    
                    {/* Post Media */}
                    {mediaUrl && (
                      <img 
                        src={mediaUrl} 
                        alt={post.title} 
                        className="item-media"
                        onClick={() => handleOpenDialog(post)}
                      />
                    )}

                    {/* Post Content */}
                    <div className="leaderboard-content">
                      <div className="item-header">
                        <h3 
                          className="item-title"
                          onClick={() => handleOpenDialog(post)}
                        >
                          {post.title}
                        </h3>
                      </div>

                      <p className="item-description">{post.description}</p>
                      
                      {/* Author Info */}
                      <div 
                        className="item-author"
                        onClick={() => handleViewProfile(postUserId)}
                      >
                        <div className="author-avatar">
                          {postUserName.charAt(0).toUpperCase()}
                        </div>
                        <div className="author-info">
                          <div className="author-name">{postUserName}</div>
                          <div className="author-role">Posted {timeAgo}</div>
                        </div>
                      </div>

                      {/* Stats and Actions */}
                      <div className="item-stats">
                        <button
                          onClick={() => handleLike(post._id)}
                          className={`stat-btn ${likedByUser ? 'liked' : ''}`}
                          disabled={!currentUser?.token}
                        >
                          <ThumbUpIcon size={18} />
                          {post.likes.length}
                        </button>

                        <button
                          onClick={() => handleToggleComments(post._id)}
                          className={`stat-btn ${isExpanded ? 'active' : ''}`}
                        >
                          <ChatBubbleIcon size={18} />
                          {post.comments.length}
                        </button>
                        
                        <div className="score-display">
                          Likes: {totalLikes}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Comments Section */}
                    {isExpanded && (
                      <div className="comments-section">
                        {/* Comment Input */}
                        {currentUser?.token && (
                          <div className="comment-input-container">
                            <textarea
                              className="comment-input"
                              placeholder="Add a comment..."
                              value={newCommentText[post._id] || ""}
                              onChange={(e) => setNewCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                              rows={2}
                            />
                            <button 
                              className="comment-submit-btn"
                              onClick={() => handleAddComment(post._id)}
                            >
                              Post
                            </button>
                          </div>
                        )}

                        {/* Comments List */}
                        <div className="comments-list">
                          {post.comments.length > 0 ? (
                            post.comments.slice().reverse().slice(0, 5).map((comment, i) => ( 
                              <div key={comment._id || i} className="comment-item">
                                <div className="comment-avatar">
                                  {comment.user?.name ? comment.user.name[0] : 'A'}
                                </div>
                                <div className="comment-content">
                                  <div className="comment-author">
                                    {comment.user?.name || "Anonymous"}
                                  </div>
                                  <p className="comment-text">{comment.text}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="no-comments">
                              No comments yet. Be the first!
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
      
      {/* Post Detail Dialog */}
      <PostDetailDialog 
        open={isDialogOpen}
        handleClose={handleCloseDialog}
        post={selectedPost}
      />
    </div>
  );
};

export default Leaderboard;