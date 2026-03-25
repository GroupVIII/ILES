import React, { useState, useEffect } from 'react';

const SupervisorLogList = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        fetch('http://127.0.0.1:8000/api/all-logs/', { // We'll create this endpoint next
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setLogs(data));
    }, []);

    const handleApprove = async (logId) => {
        // Logic to update status to 'APPROVED'
        console.log("Approving log:", logId);
    };

    return (
        <div className="supervisor-list">
            <h3>Pending Approvals</h3>
            <table>
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
                            <td>{log.student_name}</td>
                            <td>{log.week_number}</td>
                            <td>{log.activities.substring(0, 50)}...</td>
                            <td>
                                <button onClick={() => handleApprove(log.id)}>Approve</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SupervisorLogList;