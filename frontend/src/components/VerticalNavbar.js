import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Home as HomeIcon,
  TrendingUp as LeaderboardIcon,
  Compass as ExploreIcon,
  User as PersonIcon,
  LogOut as LogoutIcon,
} from "lucide-react";
import "../styles/navbar.css";

const VerticalNavbar = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active nav based on current path
  const getActiveNav = () => {
    const path = location.pathname;
    if (path === "/home") return "home";
    if (path === "/leaderboard") return "leaderboard";
    if (path === "/explore") return "explore";
    if (path === "/profile" || path.startsWith("/profile")) return "profile";
    return "";
  };

  const activeNav = getActiveNav();

  const handleNavClick = (navItem) => {
    if (navItem === "home") navigate("/home");
    else if (navItem === "leaderboard") navigate("/leaderboard");
    else if (navItem === "explore") navigate("/explore");
    else if (navItem === "profile") navigate("/profile");
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("todoapp");
      toast.success("Logged out successfully");
      navigate("/auth");
    }
  };

  return (
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
  );
};

export default VerticalNavbar;