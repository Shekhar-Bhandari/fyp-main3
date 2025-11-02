import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PostServices from "../Services/PostServices";
import toast from "react-hot-toast";
import {
  Home as HomeIcon,
  TrendingUp as LeaderboardIcon,
  Compass as ExploreIcon,
  User as PersonIcon,
  LogOut as LogoutIcon,
  ThumbsUp as ThumbUpIcon,
  MessageCircle as ChatBubbleIcon,
  X as CloseIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Bell as BellIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
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

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("explore");
  const [selectedSpec, setSelectedSpec] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
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
    let filtered = posts;

    // Filter by specialization
    if (selectedSpec !== "all") {
      filtered = filtered.filter(post => post.specialization === selectedSpec);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        post.user?.name.toLowerCase().includes(query)
      );
    }

    setFilteredPosts(filtered);
  }, [selectedSpec, searchQuery, posts]);

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

  const handleNavClick = (navItem) => {
    setActiveNav(navItem);
    if (navItem === "home") navigate("/home");
    else if (navItem === "leaderboard") navigate("/leaderboard");
    else if (navItem === "explore") navigate("/explore");
    else if (navItem === "profile") navigate("/profile");
  };

  const handleViewProfile = (userId) => {
    if (userId) {
      if (userId === currentUser?._id) {
        navigate("/profile");
      } else {
        navigate(`/profile-view/${userId}`);
      }
    }
  };

  const handleViewPost = (postId) => {
    navigate(`/post/${postId}`);
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
            className={`nav-item ${activeNav === 'explore' ? 'active' : ''}`}
            onClick={() => handleNavClick('explore')}
          >
            <ExploreIcon size={20} />
            <span>Explore</span>
          </button>
          <button 
            className={`nav-item ${activeNav === 'profile' ? 'active' : ''}`}
            onClick={() => handleNavClick('profile')}
          >
            <PersonIcon size={20} />
            <span>Profile</span>
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
            <h1 className="page-title">Explore Projects</h1>
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
          {/* Search and Filter Bar */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <SearchIcon 
                  size={20} 
                  style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)'
                  }} 
                />
                <input
                  type="text"
                  placeholder="Search projects, users, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 44px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                />
              </div>
              <select
                value={selectedSpec}
                onChange={(e) => setSelectedSpec(e.target.value)}
                style={{
                  padding: '12px 16px',
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

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: 'var(--nav-active)',
              borderRadius: '8px'
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                {filteredPosts.length} {filteredPosts.length === 1 ? 'project' : 'projects'} found
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Clear search
                </button>
              )}
            </div>
          </div>

          {/* Posts Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3 className="empty-state-title">No posts found</h3>
                <p className="empty-state-text">
                  {searchQuery ? "Try adjusting your search" : "Be the first to create one!"}
                </p>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const postUser = post.user;
                const postUserName = postUser?.name || "Unknown";
                const mediaUrl = post.media?.url || post.image || '';
                const relativeTime = formatRelativeTime(post.createdAt);
                
                return (
                  <div 
                    key={post._id} 
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => handleViewPost(post._id)}
                  >
                    {mediaUrl && (
                      <div style={{ 
                        width: '100%', 
                        height: '200px', 
                        overflow: 'hidden',
                        backgroundColor: '#f0f0f0'
                      }}>
                        <img 
                          src={mediaUrl} 
                          alt={post.title}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    )}
                    
                    <div style={{ padding: '16px' }}>
                      <h3 style={{ 
                        margin: '0 0 8px 0',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: 'var(--text-primary)'
                      }}>
                        {post.title}
                      </h3>
                      
                      {post.specialization && (
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--nav-active)',
                          fontSize: '12px',
                          color: 'var(--primary-color)',
                          marginBottom: '12px'
                        }}>
                          {SPECIALIZATIONS.find(s => s.value === post.specialization)?.label}
                        </span>
                      )}
                      
                      <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        margin: '0 0 16px 0',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {post.description}
                      </p>
                      
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--border-color)'
                      }}>
                        <div 
                          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProfile(postUser?._id);
                          }}
                        >
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            {postUserName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ 
                              fontSize: '14px', 
                              fontWeight: '500',
                              color: 'var(--text-primary)'
                            }}>
                              {postUserName}
                            </div>
                            <div style={{ 
                              fontSize: '12px',
                              color: 'var(--text-secondary)'
                            }}>
                              {relativeTime}
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            color: 'var(--text-secondary)',
                            fontSize: '14px'
                          }}>
                            <ThumbUpIcon size={16} />
                            {post.likes.length}
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            color: 'var(--text-secondary)',
                            fontSize: '14px'
                          }}>
                            <ChatBubbleIcon size={16} />
                            {post.comments.length}
                          </div>
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
    </div>
  );
};

export default Explore;