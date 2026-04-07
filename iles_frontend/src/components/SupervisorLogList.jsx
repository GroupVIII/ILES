// import React, { useState, useEffect } from 'react';
// import './SupervisorLogList.css'; // Make sure the CSS is imported

// // Mock data array to simulate fetching from a backend
// const MOCK_LOGS = [
//     {
//         id: 101,
//         internName: "Alice Johnson",
//         date: "2023-11-10T10:00:00Z",
//         type: "Weekly Review",
//         summary: "Completed all frontend assignments successfully. Needs work on CSS Grid but overall great progress.",
//         rating: 4,
//         status: "Acknowledged"
//     },
//     {
//         id: 102,
//         internName: "Alice Johnson",
//         date: "2023-11-17T11:30:00Z",
//         type: "Task Approval",
//         summary: "Approved 15 hours of work for week 3. All tasks meet expectations.",
//         rating: 5,
//         status: "Submitted"
//     },
//     {
//         id: 103,
//         internName: "Bob Smith",
//         date: "2023-11-18T09:15:00Z",
//         type: "Mid-Term Evaluation",
//         summary: "Bob is struggling with backend integrations but excels at documentation. Scheduling a 1-on-1.",
//         rating: 3,
//         status: "Draft"
//     }
// ];

// function SupervisorLogList() {
//     const [logs, setLogs] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // Simulate API fetch on mount
//     useEffect(() => {
//         const fetchLogs = async () => {
//             try {
//                 // Simulating a network request delay for demonstration
//                 await new Promise(resolve => setTimeout(resolve, 800));
//                 setLogs(MOCK_LOGS);
//                 setLoading(false);
//             } catch (err) {
//                 setError(err);
//                 setLoading(false);
//             }
//         };

//         fetchLogs();
//     }, []);

//     const getStatusClass = (status) => {
//         switch(status.toLowerCase()) {
//             case 'acknowledged': return 'status-acknowledged';
//             case 'submitted': return 'status-submitted';
//             case 'draft': return 'status-draft';
//             default: return '';
//         }
//     };

//     if (loading) {
//         return (
//             <div className="loglist-container loading-container">
//                 <div className="spinner"></div>
//                 <h2>Loading Supervisor Logs...</h2>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="loglist-container error-container">
//                 <h2>Something went wrong</h2>
//                 <p>{error.message}</p>
//             </div>
//         );
//     }

//     return (
//         <div className="loglist-container">
//             <header className="loglist-header">
//                 <div>
//                     <h1 className="loglist-title">Supervisor Logs</h1>
//                     <p className="loglist-subtitle">Manage and review intern evaluations and feedback.</p>
//                 </div>
//                 <button className="create-btn">
//                     <span className="create-icon">+</span> New Entry
//                 </button>
//             </header>

//             <div className="loglist-grid">
//                 {logs.map(log => (
//                     <div key={log.id} className="log-card">
//                         <div className="card-header">
//                             <span className="log-type">{log.type}</span>
//                             <span className={`log-status ${getStatusClass(log.status)}`}>
//                                 {log.status}
//                             </span>
//                         </div>
                        
//                         <div className="card-body">
//                             <h3 className="intern-name">{log.internName}</h3>
//                             <p className="log-date">
//                                 {new Date(log.date).toLocaleDateString()} at {new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
//                             </p>
//                             <p className="log-summary">{log.summary}</p>
//                         </div>
                        
//                         <div className="card-footer">
//                             <div className="log-rating">
//                                 {Array.from({ length: 5 }).map((_, i) => (
//                                     <span key={i} className={`star ${i < log.rating ? 'filled' : 'empty'}`}>★</span>
//                                 ))}
//                             </div>
//                             <button className="view-btn">View Log</button>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }

// export default SupervisorLogList;
