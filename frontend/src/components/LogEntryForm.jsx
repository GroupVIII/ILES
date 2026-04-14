import React, { useState } from 'react';

const LogEntryForm = ({ onLogAdded }) => {
    const [formData, setFormData] = useState({
        week_number: '',
        activities: '',
        challenges: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('http://127.0.0.1:8000/api/logs/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // For now, we assume no Auth for speed, but we'll add JWT next!
            },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            alert("Log submitted successfully!");
            onLogAdded(); // Refresh the list
        }
    };

    return (
        <form onSubmit={handleSubmit} className="log-form">
            <h3>Submit Weekly Log</h3>
            <input 
                type="number" 
                placeholder="Week Number" 
                onChange={(e) => setFormData({...formData, week_number: e.target.value})} 
            />
            <textarea 
                placeholder="Activities done this week..." 
                onChange={(e) => setFormData({...formData, activities: e.target.value})}
            />
            <textarea 
                placeholder="Challenges faced..." 
                onChange={(e) => setFormData({...formData, challenges: e.target.value})}
            />
            <button type="submit">Submit Log</button>
        </form>
    );
};

export default LogEntryForm;