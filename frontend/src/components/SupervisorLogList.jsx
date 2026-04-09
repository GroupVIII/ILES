import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SupervisorLogList = () => {
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            const token = localStorage.getItem('access_token');
            try {
                const res = await axios.get('http://127.0.0.1:8000/api/all-logs/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setLogs(res.data);
            } catch (err) {
                setError("Failed to load logs.");
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
        } catch (err) {
            alert("Approval failed.");
        }
    };

    if (error) return <p style={{color: '#ef4444'}}>{error}</p>;

    return (
        <table className="log-table">
            <thead>
                <tr>
                    <th>Week</th>
                    <th>Activities</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {logs.map(log => (
                    <tr key={log.id}>
                        <td>Week {log.week_number}</td>
                        <td>{log.activities}</td>
                        <td><button className="approve-btn" onClick={() => handleApprove(log.id)}>Approve</button></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default SupervisorLogList;