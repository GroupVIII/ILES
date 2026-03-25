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
          <span>Welcome, <strong>{userRole}</strong></span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      
      <div className="dashboard-grid">
        {userRole === 'STUDENT' ? (
          <>
            <aside className="sidebar">
              {/* Only students see the submission form */}
              <LogEntryForm onLogAdded={() => window.location.reload()} />
            </aside>
            <main className="content">
              <IssueList />
            </main>
          </>
        ) : (
          <main className="content full-width">
            {/* Supervisors see the list of all logs to approve */}
            <h2>Supervisor Dashboard</h2>
            <p>Awaiting Weekly Logs for Approval...</p>
            {/* We will create the SupervisorLogList next! */}
          </main>
        )}
      </div>
    </div>
  )
}

export default App;