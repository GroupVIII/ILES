import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  // Sync token state if it changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('access_token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router>
      <Routes>
        {/* If logged in, /login redirects to /dashboard */}
        <Route 
          path="/login" 
          element={!token ? <Login setToken={setToken} /> : <Navigate to="/dashboard" />} 
        />
        
        {/* Protected Dashboard */}
        <Route 
          path="/dashboard" 
          element={token ? <Dashboard /> : <Navigate to="/login" />} 
        />

        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;