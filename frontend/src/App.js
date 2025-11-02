import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Pages Components
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import Leaderboard from "./pages/LeaderBoard";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile"; 

// Components/Context
import { DarkModeProvider } from "./components/DarkModeToggle"; 
import ProfileSetup from "./pages/ProfileSetup";
import ViewProfile from "./pages/ViewProfile";
import  Explore  from "./pages/Explore";

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <Routes>
          {/* Authentication */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Main App Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          
          {/* Profile Routes */}
          {/* 1. Route for the Current User (static) */}
          <Route path="/profile" element={<Profile />} />
           <Route path="/explore" element={<Explore />} />
         
          {/* 2. Route for Other Users (dynamic with ID) */}
          {/* ⚠️ Note: I am assuming you intended to use ViewProfile, not PublicProfile */}
          <Route path="/profile-view/:userId" element={<ViewProfile />} />
          <Route path="/profile-setup" element={<ProfileSetup/>} />
          
        </Routes>
        <Toaster />
      </Router>
    </DarkModeProvider>
  );
}

export default App;