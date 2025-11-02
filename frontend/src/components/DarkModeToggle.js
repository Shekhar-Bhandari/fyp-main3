import { IconButton } from '@mui/material';
import { DarkMode as DarkModeIcon, LightMode as LightModeIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';

// DarkModeProvider - wrap your app with this
export const DarkModeProvider = ({ children }) => {
  useEffect(() => {
    // Load dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    
    // Listen for storage changes (when changed from other tabs/components)
    const handleStorageChange = () => {
      const isDark = localStorage.getItem("darkMode") === "true";
      // You can add any global dark mode logic here if needed
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('darkModeChange', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('darkModeChange', handleStorageChange);
    };
  }, []);

  return <>{children}</>;
};

// DarkModeToggle Component - MUI styled version
export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);

    const handleChange = () => {
      const isDark = localStorage.getItem("darkMode") === "true";
      setDarkMode(isDark);
    };

    window.addEventListener('darkModeChange', handleChange);
    
    return () => {
      window.removeEventListener('darkModeChange', handleChange);
    };
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    // Save to localStorage
    localStorage.setItem("darkMode", newMode.toString());
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('darkModeChange'));
  };

  return (
    <IconButton
      onClick={toggleDarkMode}
      color="default"
      size="medium"
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? (
        <LightModeIcon sx={{ color: '#fbbf24' }} />
      ) : (
        <DarkModeIcon sx={{ color: '#374151' }} />
      )}
    </IconButton>
  );
}

// Hook to use dark mode state in components
export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);

    const handleChange = () => {
      const isDark = localStorage.getItem("darkMode") === "true";
      setDarkMode(isDark);
    };

    window.addEventListener('storage', handleChange);
    window.addEventListener('darkModeChange', handleChange);
    
    return () => {
      window.removeEventListener('storage', handleChange);
      window.removeEventListener('darkModeChange', handleChange);
    };
  }, []);

  return darkMode;
};