import { useState, useEffect } from 'react'
import './App.css'
import Login from './components/Login'
import IssueList from './components/IssueList'
import LogEntryForm from './components/LogEntryForm'

function App() {
  // Check if a token already exists in the browser's memory
  const [token, setToken] = useState(localStorage.getItem('access_token'))

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setToken(null)
  }

  // If no token, show ONLY the Login page
  if (!token) {
    return <Login setToken={setToken} />
  }

  // If token exists, show the full ILES Dashboard
  return (
    <div className="iles-container">
      <nav className="navbar">
        <h1>ILES Portal</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </nav>
      
      <div className="dashboard-grid">
        <aside className="sidebar">
          <LogEntryForm onLogAdded={() => window.location.reload()} />
        </aside>
        
        <main className="content">
          <IssueList />
        </main>
      </div>
    </div>
  )
}

export default App