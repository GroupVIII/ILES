import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SupervisorLogList = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            const token = localStorage.getItem('access_token');
            try {
                const res = await axios.get('http://127.0.0.1:8000/api/all-logs/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLogs(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Fetch error:", err);
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const handleApprove = async (id) => {
        const token = localStorage.getItem('access_token');
        try {
            await axios.patch(`http://127.0.0.1:8000/api/logs/${id}/approve/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update the UI by removing the approved log from the list
            setLogs(logs.filter(log => log.id !== id));
            alert("Log Approved Successfully!");
        } catch (err) {
            alert("Approval failed. Check permissions.");
        }
    };

    if (loading) return <p>Loading logs...</p>;

    return (
        <div className="log-table-container">
            {logs.length === 0 ? (
                <p>No pending logs found.</p>
            ) : (
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