import React, { useState, useEffect } from 'react';

const IssueList = () => {
    const [issues, setIssues] = useState([]);

useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    fetch('http://127.0.0.1:8000/api/issues/', {
        headers: {
            'Authorization': `Bearer ${token}`, // This tells Django who you are!
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(data => setIssues(data))
    .catch(err => console.error("Auth Error:", err));
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