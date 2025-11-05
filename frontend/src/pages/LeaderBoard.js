// Leaderboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // <-- Added useLocation
import PostServices from "../Services/PostServices";
import toast from "react-hot-toast";
import VerticalNavbar from "../components/VerticalNavbar";
import {
  Bell as NotificationsIcon,
  Plus as AddIcon,
  ThumbsUp as ThumbUpIcon,
  FileText as ArticleIcon,
  Eye as VisibilityIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Calendar as CalendarIcon, 
  Home as HomeIcon, // <-- Added for menu item
  Compass as ExploreIcon, // <-- Added for menu item
  User as UserIcon, // <-- Added for menu item
  LogOut as LogoutIcon, // <-- Added for menu item
} from "lucide-react";
import '../styles/navbar.css';
import '../styles/leaderboard.css';

// Utility to format period for display
const formatPeriod = (period) => {
  if (period === 'all_time') return 'All Time';
  const [year, month] = period.split('-');
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

// --- MENU DEFINITION ---
const menuItems = [
  { name: 'Leaderboard', path: '/', icon: HomeIcon, requiredAuth: true },
  { name: 'Explore', path: '/explore', icon: ExploreIcon, requiredAuth: true },
  { name: 'Profile', path: '/profile', icon: UserIcon, requiredAuth: true },
];
// -----------------------

const Leaderboard = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 }); 
  const [darkMode, setDarkMode] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all_time');
  const [availablePeriods, setAvailablePeriods] = useState([]);

  const navigate = useNavigate();
  const location = useLocation(); // <-- Get current path

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

  const updateMonthlyTimer = () => {
    // Timer logic to reset at the end of the current month (23:59:59)
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const endOfMonth = new Date(nextMonth - 1); // Last millisecond of the current month
    
    // Set time to 23:59:59
    endOfMonth.setHours(23, 59, 59, 999);
    
    const diff = endOfMonth - now;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setTimeRemaining({ days, hours, minutes, seconds });
  };

  const fetchAllUsersRanking = useCallback(async (periodFilter) => {
    try {
      setLoading(true);
      const res = await PostServices.getAllPosts();
      const allPosts = res.data;
      
      const uniquePeriods = new Set();
      allPosts.forEach(post => {
        const date = new Date(post.createdAt);
        const periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        uniquePeriods.add(periodKey);
      });
      setAvailablePeriods(Array.from(uniquePeriods).sort().reverse());

      const filteredPosts = periodFilter === 'all_time'
        ? allPosts
        : allPosts.filter(post => {
          const date = new Date(post.createdAt);
          const postPeriodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          return postPeriodKey === periodFilter;
        });

      const userStatsMap = {};

      filteredPosts.forEach(post => {
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
        userStatsMap[userId].totalViews += post.views?.length || 0; 
      });

      const userRankings = Object.values(userStatsMap);
      userRankings.sort((a, b) => b.totalLikes - a.totalLikes);

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
  }, []); 

  useEffect(() => {
    updateUser();
    fetchAllUsersRanking(selectedPeriod);
    updateMonthlyTimer(); 
    
    const timerInterval = setInterval(() => {
      updateMonthlyTimer();
    }, 1000);

    const dataIntervalId = setInterval(() => {
        fetchAllUsersRanking(selectedPeriod);
    }, 60000);

    window.addEventListener("storage", updateUser);
    return () => {
      window.removeEventListener("storage", updateUser);
      clearInterval(dataIntervalId);
      clearInterval(timerInterval);
    }
  }, [selectedPeriod, fetchAllUsersRanking]); 

  const handleLogout = () => {
    localStorage.removeItem("todoapp");
    setCurrentUser(null);
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const handleViewProfile = (userId) => {
    if (currentUser?._id === userId) {
      navigate("/profile");
    } else {
      navigate(`/profile-view/${userId}`);
    }
  };

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
      'ui-ux': 'UI/UX Designer', 'web-dev': 'Web Developer', 'mobile-dev': 'Mobile Developer', 
      'ai-ml': 'AI/ML Engineer', 'data-science': 'Data Scientist', 'cloud-computing': 'Cloud Engineer',
      'devops': 'DevOps Engineer', 'cybersecurity': 'Security Expert', 'blockchain': 'Blockchain Developer', 
      'game-dev': 'Game Developer', 'iot': 'IoT Engineer', 'other': 'Developer',
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
    <div className="app-container">
      {/* Vertical Navbar - Passing menu items and current path */}
      <VerticalNavbar 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        menuItems={menuItems} // <-- New prop
        activePath={location.pathname} // <-- New prop for highlighting
      />

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-header">
          <div className="header-left">
            <h1 className="page-title">{formatPeriod(selectedPeriod)} Leaderboard</h1>
            
            {/* Period Filter Dropdown */}
            <div className="period-filter">
                <CalendarIcon size={20} style={{ marginRight: '8px', color: 'var(--text-color)' }} />
                <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="period-select"
                >
                    <option value="all_time">All Time</option>
                    {availablePeriods.map(period => (
                        <option key={period} value={period}>
                            {formatPeriod(period)}
                        </option>
                    ))}
                </select>
            </div>
          </div>
          <div className="header-right">
            <button onClick={toggleDarkMode} className="dark-mode-toggle">
              {darkMode ? <SunIcon size={20} /> : <MoonIcon size={20} />}
            </button>
            <button className="notification-btn">
              <NotificationsIcon size={20} />
            </button>
            <button className="new-post-btn" onClick={() => navigate('/create-post')}>
              <AddIcon size={18} />
              New post
            </button>
          </div>
        </header>

        {/* Content Container (Rankings List, etc. remains the same) */}
        <div className="content-container">
          {/* User Rankings List */}
          <div className="rankings-list">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
              </div>
            ) : topUsers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏆</div>
                <h3 className="empty-state-title">No Users Yet</h3>
                <p className="empty-state-text">Be the first to create posts and climb the leaderboard!</p>
                <button 
                  onClick={() => navigate("/create-post")}
                  style={{ 
                    marginTop: '16px', 
                    padding: '12px 24px', 
                    backgroundColor: 'var(--primary-color)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontSize: '14px', 
                    fontWeight: '500' 
                  }}
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
                          width: '48px', height: '48px', borderRadius: '50%',
                          backgroundColor: getAvatarColor(user.rank), color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '18px', fontWeight: '600', border: '2px solid #f3f4f6'
                        }}
                      >
                        {user.name ? user.name[0].toUpperCase() : 'U'}
                      </div>
                      <div className="user-info">
                        <div className="user-name">
                          {user.name}
                          {isCurrentUser && <span className="you-badge">You</span>}
                          <button 
                            onClick={(e) => { e.stopPropagation(); toast.info('Follow feature coming soon!'); }}
                            style={{
                              background: 'transparent', border: 'none', color: 'var(--primary-color)',
                              fontSize: '14px', fontWeight: '500', cursor: 'pointer', padding: '0', marginLeft: '8px'
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
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="right-sidebar">
        <div className="voting-timer">
          <div className="timer-title">Monthly Contest ends in</div>
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
            <div className="timer-value">
              <span className="timer-number">{String(timeRemaining.seconds).padStart(2, '0')}</span>
              <span className="timer-label">Secs</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Leaderboard;