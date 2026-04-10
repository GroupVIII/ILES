import { useState } from "react";
// import Issue from "../components/Issue.jsx";
import AdminDashboard from "./AdminDashboard";
import StudentDashboard from "./StudentDashboard";
import SupervisorDashboard from "./SupervisorDashboard";

function Dashboard({ user, onLogout }) {
  // If no user object exists, bail out to prevent crashes
  if (!user) return null;

  return (
    <div className="dashboard-container">
      {/* Top Navigation Bar with Logout */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '1rem 2rem', 
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{color: '#334155'}}>
          Welcome: <strong>{user.email}</strong> 
          <span style={{
            marginLeft: '10px', 
            background: '#e0e7ff', 
            color: '#4f46e5', 
            padding: '4px 8px', 
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: '600',
            textTransform: 'uppercase'
          }}>
            {user.role}
          </span>
        </div>
        <button 
            onClick={onLogout} 
            style={{ 
                padding: '0.5rem 1.25rem', 
                background: '#ef4444', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontWeight: '600'
            }}>
          Logout
        </button>
      </div>

      {/* Conditionally Render Sub-Dashboards */}
      <div className="dashboard-content" style={{ padding: '2rem' }}>
        {user.role === 'admin' && <AdminDashboard />}
        {user.role === 'supervisor' && <SupervisorDashboard />}
        {user.role === 'student' && <StudentDashboard />}
        
        {!['admin', 'supervisor', 'student'].includes(user.role) && (
            <div>
              <h2>Unauthorized access</h2>
              <p>Your assigned role was not recognized.</p>
            </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
