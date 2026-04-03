// import React from 'react';

import { useState } from "react";
/* import './Issue.css'; */

function Issue({ issue }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
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
    //                 <p><strong>Assignee:</strong> {issue.assignee}</p>
    //             </div>
    //         )}
//         </div>
//     );
// }

export default Issue;   