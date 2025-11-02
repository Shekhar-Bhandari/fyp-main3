// Leaderboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PostServices from "../Services/PostServices";
import toast from "react-hot-toast";
import {
  Home as HomeIcon,
  TrendingUp as LeaderboardIcon,
  Compass as ExploreIcon,
  Bell as NotificationsIcon,
  User as PersonIcon,
  Plus as AddIcon,
  ThumbsUp as ThumbUpIcon,
  FileText as ArticleIcon,
  Eye as VisibilityIcon,
} from "lucide-react";
import '../styles/leaderboard.css';

const Leaderboard = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("leaderboard");
  const [timeRemaining, setTimeRemaining] = useState({ days: 2, hours: 14, minutes: 56 });

  const navigate = useNavigate();

  const updateUser = () => {
    const user = JSON.parse(localStorage.getItem("todoapp"));
    setCurrentUser(user);
  };

  useEffect(() => {
    updateUser();
    fetchAllUsersRanking();
    
    const intervalId = setInterval(() => {
      fetchAllUsersRanking();
    }, 60000);

    // Update timer every minute
    const timerInterval = setInterval(() => {
      updateTimer();
    }, 60000);

    window.addEventListener("storage", updateUser);
    return () => {
      window.removeEventListener("storage", updateUser);
      clearInterval(intervalId);
      clearInterval(timerInterval);
    }
  }, []);

  const updateTimer = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const diff = nextMonth - now;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    setTimeRemaining({ days, hours, minutes });
  };

  const fetchAllUsersRanking = async () => {
    try {
      setLoading(true);
      const res = await PostServices.getAllPosts();
      const posts = res.data;

      // Calculate stats per user
      const userStatsMap = {};

      posts.forEach(post => {
        const userId = post.user?._id;
        if (!userId) return;

        if (!userStatsMap[userId]) {
          userStatsMap[userId] = {
            id: userId,
            name: post.user.name,
            specialization: post.user.specialization || 'other',
            avatar: post.user.avatar || null,
            totalLikes: 0,
            totalPosts: 0,
            totalViews: 0,
          };
        }

        userStatsMap[userId].totalLikes += post.likes?.length || 0;
        userStatsMap[userId].totalPosts += 1;
        userStatsMap[userId].totalViews += post.views || 0;
      });

      // Convert to array and sort by total likes
      const userRankings = Object.values(userStatsMap);
      userRankings.sort((a, b) => b.totalLikes - a.totalLikes);

      // Add rank numbers
      const rankedUsers = userRankings.map((user, index) => ({
        ...user,
        rank: index + 1,
      }));

      setTopUsers(rankedUsers);
      
    } catch (error) {
      console.error("Error fetching user rankings:", error);
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const handleNavClick = (navItem) => {
    setActiveNav(navItem);
    if (navItem === "home") navigate("/home");
    else if (navItem === "leaderboard") navigate("/leaderboard");
    else if (navItem === "explore") navigate("/explore");
    else if (navItem === "profile") navigate("/profile");
  };

  const handleViewProfile = (userId) => {
    if (currentUser?._id === userId) {
      navigate("/profile");
    } else {
      navigate(`/profile-view/${userId}`);
    }
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankClass = (rank) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return '';
  };

  const getSpecializationLabel = (spec) => {
    const labels = {
      'ui-ux': 'UI/UX Designer',
      'web-dev': 'Web Developer',
      'mobile-dev': 'Mobile Developer',
      'ai-ml': 'AI/ML Engineer',
      'data-science': 'Data Scientist',
      'cloud-computing': 'Cloud Engineer',
      'devops': 'DevOps Engineer',
      'cybersecurity': 'Security Expert',
      'blockchain': 'Blockchain Developer',
      'game-dev': 'Game Developer',
      'iot': 'IoT Engineer',
    };
    return labels[spec] || 'Developer';
  };

  const getAvatarColor = (rank) => {
    if (rank === 1) return '#ffd700';
    if (rank === 2) return '#c0c0c0';
    if (rank === 3) return '#cd7f32';
    return '#6366f1';
  };

  return (
    <div className="leaderboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path stroke="currentColor" strokeWidth="2" d="M12 6v12M6 12h12"/>
          </svg>
          <span>Connectiva</span>
        </div>
        
        <nav className="nav-menu">
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
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="date-display">Today {today}</div>
          <div className="top-actions">
            <button className="new-post-btn" onClick={() => navigate('/create-post')}>
              <AddIcon size={18} />
              New post
            </button>
            <button className="icon-btn" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', color: '#6b7280' }}>
              <NotificationsIcon size={20} />
            </button>
            <button 
              className="icon-btn"
              onClick={() => handleNavClick('profile')}
              style={{ background: '#818cf8', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', color: 'white', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <PersonIcon size={20} />
            </button>
          </div>
        </header>

        {/* Page Title */}
        <div className="page-title">
          <h1>All Time Leaderboard</h1>
        </div>

        {/* User Rankings List */}
        <div className="rankings-list">
          {loading ? (
            <div className="loading-container">
              <div style={{ width: '50px', height: '50px', border: '4px solid #e5e7eb', borderTop: '4px solid #0d9488', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : topUsers.length === 0 ? (
            <div className="no-users">
              <h3>No Users Yet</h3>
              <p>Be the first to create posts and climb the leaderboard!</p>
              <button 
                onClick={() => navigate("/create-post")}
                style={{ marginTop: '16px', padding: '12px 24px', backgroundColor: '#0d9488', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
              >
                Create Your First Post
              </button>
            </div>
          ) : (
            topUsers.map((user) => {
              const isCurrentUser = currentUser?._id === user.id;
              const rankClass = getRankClass(user.rank);
              const rankIcon = getRankIcon(user.rank);
              
              return (
                <div 
                  key={user.id} 
                  className={`user-card ${isCurrentUser ? 'current-user' : ''}`}
                  onClick={() => handleViewProfile(user.id)}
                >
                  <div className="user-left">
                    <div className={`user-rank ${rankClass}`}>
                      {rankIcon}
                    </div>
                    <div 
                      className="user-avatar"
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: getAvatarColor(user.rank),
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: '600',
                        border: '2px solid #f3f4f6'
                      }}
                    >
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div className="user-info">
                      <div className="user-name">
                        {user.name}
                        {isCurrentUser && <span className="you-badge">You</span>}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info('Follow feature coming soon!');
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#0d9488',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            padding: '0',
                            marginLeft: '8px'
                          }}
                        >
                          Follow
                        </button>
                      </div>
                      <div className="user-spec">
                        {getSpecializationLabel(user.specialization)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="user-right">
                    <div className="user-stat">
                      <ThumbUpIcon size={18} color="#9ca3af" />
                      <div>
                        <div className="stat-value">{user.totalLikes}</div>
                        <div className="stat-label">Cherries</div>
                      </div>
                    </div>
                    <div className="user-stat">
                      <ArticleIcon size={18} color="#9ca3af" />
                      <div>
                        <div className="stat-value">{user.totalPosts}</div>
                        <div className="stat-label">Posts</div>
                      </div>
                    </div>
                    <div className="user-stat">
                      <VisibilityIcon size={18} color="#9ca3af" />
                      <div>
                        <div className="stat-value">{user.totalViews}</div>
                        <div className="stat-label">Views</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="right-sidebar">
        <div className="voting-timer">
          <div className="timer-title">Voting ends in</div>
          <div className="timer-values">
            <div className="timer-value">
              <span className="timer-number">{String(timeRemaining.days).padStart(2, '0')}</span>
              <span className="timer-label">Days</span>
            </div>
            <div className="timer-value">
              <span className="timer-number">{String(timeRemaining.hours).padStart(2, '0')}</span>
              <span className="timer-label">Hrs</span>
            </div>
            <div className="timer-value">
              <span className="timer-number">{String(timeRemaining.minutes).padStart(2, '0')}</span>
              <span className="timer-label">Mins</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Leaderboard;