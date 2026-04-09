import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  // This function is passed to Login.jsx to update the state here
  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
  };

  return (
    <Router>
      <div className={!token ? "login-container" : ""}>
        <Routes>
          <Route 
            path="/login" 
            element={!token ? <Login setToken={handleLoginSuccess} /> : <Navigate to="/dashboard" />} 
          />
          
          <Route 
            path="/dashboard" 
            element={token ? <Dashboard /> : <Navigate to="/login" />} 
          />

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;