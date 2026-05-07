import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SupervisorLogList = () => {
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                setError("Authorization token missing.");
                return;
            }

            try {
                const res = await axios.get('http://127.0.0.1:8000/api/all-logs/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setLogs(res.data);
            } catch (err) {
                console.error("Fetch error:", err.response);
                setError("Failed to load logs.");
            }
        };
        fetchLogs();
    }, []);

    if (error) return <p style={{color: '#ef4444', padding: '10px'}}>{error}</p>;

    return (
        <div className="log-table-wrapper">
            {logs.length === 0 ? (
                <p>No pending logs found.</p>
            ) : (
                <table className="log-table">
                    <thead>
                        <tr>
                            <th>Week</th>
                            <th>Activities</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td>Week {log.week_number}</td>
                                <td>{log.activities}</td>
                                <td>{log.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default SupervisorLogList;