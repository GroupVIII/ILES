import React, { useState, useEffect, useRef } from 'react';
import './App.css'; 
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [user, setUser] = useState(null);
  const logoutTimerId = useRef(null);

  // --- 1. PERSISTENT AUTHENTICATION (TAB ISOLATED) ---
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('access_token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // --- 2. GLOBAL LOGOUT FUNCTION ---
  const handleLogout = () => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  // --- 3. AUTO-LOGOUT ON INACTIVITY ---
  useEffect(() => {
    if (!user) return;

    const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes in milliseconds

    const resetTimer = () => {
      if (logoutTimerId.current) clearTimeout(logoutTimerId.current);
      logoutTimerId.current = setTimeout(() => {
        alert("You have been logged out due to inactivity.");
        handleLogout();
      }, INACTIVITY_LIMIT);
    };

    const activityEvents = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => document.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      activityEvents.forEach(event => document.removeEventListener(event, resetTimer));
      if (logoutTimerId.current) clearTimeout(logoutTimerId.current);
    };
  }, [user]);

  if (!user) {
    return <Login onLoginSuccess={setUser} />;
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <Dashboard user={user} setAuthData={setUser} onLogout={handleLogout} />
    </>
  );
}

export default App;