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

    if (!role) return <div className="loading">Checking credentials...</div>;

    return (
        <div className="iles-portal">
            <nav className="navbar">
                <div className="nav-brand">
                    <h2 style={{color: '#60a5fa'}}>ILES</h2>
                </div>
                <div className="nav-user">
                    <span>Logged in as: <strong>{username}</strong></span>
                    <span className="role-badge">{role}</span>
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
                            <p className="subtitle">Submit and Track Your Weekly Progress</p>
                            <hr style={{margin: '20px 0', borderColor: '#334155'}} />
                            <div className="placeholder-card">
                                <h4>📝 Weekly Log Form</h4>
                                <p style={{marginTop: '10px'}}>Log Submission Form Coming Soon</p>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;