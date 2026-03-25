import { useState } from 'react';
import './App.css';
import Login from './components/Login';
import IssueList from './components/IssueList';
import LogEntryForm from './components/LogEntryForm';
import SupervisorLogList from './components/SupervisorLogList'; // Missing Pillar added!
import { jwtDecode } from 'jwt-decode';

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

  const decoded = jwtDecode(token);
  // We use the database key 'WORKPLACE_SUP' from your models.py
  const userRole = decoded.role || 'STUDENT'; 

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
          {userRole === 'WORKPLACE_SUP' ? (
            <main className="content full-width">
              <SupervisorLogList />
            </main>
          ) : (
            <>
              <aside className="sidebar">
                <LogEntryForm onLogAdded={() => window.location.reload()} />
              </aside>
              <main className="content">
                <IssueList />
              </main>
            </>
          )}
        </div>
      </div>
  );
}

export default App;