import { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import IssueList from './components/IssueList';
import LogEntryForm from './components/LogEntryForm';
import { jwtDecode } from 'jwt-decode'; // Ensure you've run: npm install jwt-decode

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
  }

  if (!token) {
    return <Login setToken={setToken} />
  }

  // DECODING THE ROLE
  // This is the "Identity Card" check for your security.
  const decoded = jwtDecode(token);
  console.log("This is what is inside your token:", decoded);
  const userRole = decoded.role || 'STUDENT'; // Defaulting to STUDENT if not found

  return (
      <div className="iles-container">
        <nav className="navbar">
          <h1>ILES Portal</h1>
          <div className="user-info">
            {/* Change this to see the actual raw role value */}
            <span>Welcome, <strong>{userRole}</strong></span> 
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        {/* Try checking for the exact phrase from your Admin screen */}
        {userRole === 'WORKPLACE_SUP' ? (
          <div className="supervisor-dashboard">
            <h2>Supervisor Dashboard</h2>
            <SupervisorLogList />
          </div>
        ) : (
          <div className="dashboard-grid">
            <aside className = "sidebar">
              <LogEntryForm onLogAdded={() => window.location.reload()} />
            </aside>
            <main className="content">
              <IssueList />
            </main>
          </div>
        )}
      </div>
  );
}

export default App;