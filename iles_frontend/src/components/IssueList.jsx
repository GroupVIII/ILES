// import React from 'react';

import React, { useState, useEffect } from "react";
/* import './Issue.css'; */

function Issue({ issue }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };


    useEffect(() => {
        fetchIssueDetails(issue.id);
        console.log("Issue component mounted.");   
    
    }, []);

    useEffect(() => {
        console.log(`Issue details updated: ${JSON.stringify(issue)}`);
    }, [issue]);

    const fetchIssueDetails = (id) => {
        // Simulate fetching issue details from an API
        console.log(`Fetching details for issue ID: ${id}`);
        // Here you would typically make an API call to get the issue details
    };


    return (
        <div className="issue-container">
            <div className="issue-header" onClick={toggleExpand}>
                <h3>{issue.title}</h3>
                <span>{isExpanded ? '-' : '+'}</span>
            </div>
             {isExpanded && (
                 <div className="issue-details">
                     <p><strong>Description:</strong> {issue.description}</p>
                     <p><strong>Status:</strong> {issue.status}</p>
                     <p><strong>Priority:</strong> {issue.priority}</p> *
                     <p><strong>Assignee:</strong> {issue.assignee}</p>
                 </div>
             )}
         </div>
     );
 }

export default Issue;   