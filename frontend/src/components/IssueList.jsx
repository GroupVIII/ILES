import React, { useState, useEffect } from 'react';

const IssueList = () => {
    const [issues, setIssues] = useState([]);

useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    fetch('http://127.0.0.1:8000/api/issues/', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(res => {
        // If the door is missing (404), this catches it before it crashes React
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
    })
    .then(data => {
        // Ensure 'data' is an array before setting state
        if (Array.isArray(data)) {
            setIssues(data);
        } else {
            console.error("Data received is not an array:", data);
        }
    })
    .catch(err => console.error("ILES Fetch Error:", err));
}, []);

    return (
        <section className="issue-section">
            <h2>System Issues & Feedback</h2>
            {issues.length === 0 ? (
                <p>No issues reported yet.</p>
            ) : (
                <div className="issue-grid">
                    {issues.map(issue => (
                        <div key={issue.id} className="issue-card">
                            <h3>{issue.title}</h3>
                            <span className={`badge ${issue.issue_type}`}>
                                {issue.issue_type}
                            </span>
                            <p>{issue.description}</p>
                            <small>Status: {issue.is_resolved ? "✅ Resolved" : "❌ Pending"}</small>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default IssueList;