import React from 'react';
import { getAuthData } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { role, username } = getAuthData();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
        window.location.reload();
    };

    return (
        <div className="iles-dashboard">
            <nav className="top-bar">
                <h2>ILES Portal</h2>
                <div className="user-info">
                    <span>Welcome, <strong>{username}</strong> ({role})</span>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </nav>

            <main className="dashboard-content">
                {role === 'WORKPLACE_SUP' ? (
                    <div className="supervisor-view">
                        <h3>Pending Weekly Logs</h3>
                        {/* We will render the SupervisorLogList here */}
                    </div>
                ) : (
                    <div className="student-view">
                        <h3>Your Weekly Progress</h3>
                        {/* We will render the WeeklyLogForm here */}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;