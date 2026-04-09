import React from 'react';
import { getAuthData } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import SupervisorLogList from '../components/SupervisorLogList';

const Dashboard = () => {
    const { role, username } = getAuthData();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    if (!role) return <div className="loading">Verifying Session...</div>;

    return (
        <div className="iles-portal">
            <nav className="navbar">
                <div className="nav-brand">
                    <h2 style={{color: '#60a5fa'}}>ILES</h2>
                </div>
                <div className="nav-user">
                    <span>Logged in as: <strong>{username}</strong></span>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </nav>

            <main className="dashboard-content">
                <div className="view-container">
                    {role === 'WORKPLACE_SUP' ? (
                        <>
                            <h3>Supervisor Dashboard</h3>
                            <p className="subtitle">Management Portal for Internship Logs</p>
                            <hr style={{margin: '20px 0', borderColor: '#334155'}} />
                            <SupervisorLogList />
                        </>
                    ) : (
                        <>
                            <h3>Student Portal</h3>
                            <p className="subtitle">Weekly Progress Tracker</p>
                            <hr style={{margin: '20px 0', borderColor: '#334155'}} />
                            <p>Student forms coming soon.</p>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;