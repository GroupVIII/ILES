import React from 'react';
import { useState, useEffect } from 'react';
// import axios from 'axios';

function SupervisorLogList() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    return (
        <div>
            <h1>Supervisor Log List</h1>
        </div>
    )
}
export default SupervisorLogList;


