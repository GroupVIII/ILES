import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthData } from '../utils/auth'; // Ensure this utility decodes your token
import SupervisorLogList from '../components/SupervisorLogList';
import '../App.css';

const Dashboard = () => {
    const { role, username } = getAuthData();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) navigate('/login');
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    // Prevent "layout shift" while role is being verified
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
                    {role === 'WORKPLACE_SUP' || role === 'ADMIN' ? (
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
                            <p>Submission forms coming soon.</p>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
