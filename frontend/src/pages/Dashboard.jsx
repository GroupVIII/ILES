import React from 'react';
import { getAuthData } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { role, username } = getAuthData();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        // Force a full refresh to clear React state and trigger App.jsx redirect
        window.location.href = '/login';
    };

    if (!role) {
        return <div className="loading">Verifying Session...</div>;
    }

    return (
        <div className="iles-portal">
            <nav className="navbar">
                <div className="nav-brand">
                    <h2>ILES Portal</h2>
                </div>
                <div className="nav-user">
                    <span>Welcome, <strong>{username}</strong> ({role})</span>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </nav>

            <main className="dashboard-content">
                {role === 'WORKPLACE_SUP' ? (
                    <div className="view-container">
                        <h3>Supervisor Dashboard</h3>
                        <p className="subtitle">Pending Weekly Logs for Approval</p>
                        <hr style={{margin: '20px 0', borderColor: '#334155'}} />
                        {/* Placeholder for SupervisorLogList component */}
                        <div className="placeholder-card">
                            Waiting for Student Submissions...
                        </div>
                    </div>
                ) : (
                    <div className="view-container">
                        <h3>Student Dashboard</h3>
                        <p className="subtitle">Submit Your Weekly Progress</p>
                        <hr style={{margin: '20px 0', borderColor: '#334155'}} />
                        {/* Placeholder for WeeklyLogForm component */}
                        <div className="placeholder-card">
                            Log Submission Form Coming Soon
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;