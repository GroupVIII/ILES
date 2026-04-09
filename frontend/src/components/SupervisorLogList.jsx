import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SupervisorLogList = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                setError("No security token found. Please log in again.");
                setLoading(false);
                return;
            }

            try {
                // Ensure the URL exactly matches your core/urls.py
                const res = await axios.get('http://127.0.0.1:8000/api/all-logs/', {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log("Logs received:", res.data);
                setLogs(res.data);
            } catch (err) {
                console.error("Detailed Fetch Error:", err.response || err);
                setError(err.response?.status === 401 ? "Session expired. Please log out and back in." : "Failed to load logs.");
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const handleApprove = async (id) => {
        const token = localStorage.getItem('access_token');
        try {
            await axios.patch(`http://127.0.0.1:8000/api/logs/${id}/approve/`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setLogs(logs.filter(log => log.id !== id));
            alert("Log Approved Successfully!");
        } catch (err) {
            alert("Approval failed. Ensure you have Supervisor permissions.");
        }
    };

    if (loading) return <div className="placeholder-card">Fetching live logs...</div>;
    if (error) return <div className="placeholder-card" style={{color: '#ef4444'}}>{error}</div>;

    return (
        <div className="log-table-container">
            {logs.length === 0 ? (
                <p>No pending logs found for approval.</p>
            ) : (
                <table className="log-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Week</th>
                            <th>Activities</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td>{log.student_name || 'ILES Student'}</td>
                                <td>Week {log.week_number}</td>
                                <td>{log.activities}</td>
                                <td>
                                    <button 
                                        onClick={() => handleApprove(log.id)}
                                        className="approve-btn"
                                    >
                                        Approve
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default SupervisorLogList;