import React, { useState, useEffect } from 'react';
import api from '../services/api';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('access') || localStorage.getItem('token'); 
            const response = await api.get('/api/notifications/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Handle pagination safely
            const notificationData = response.data.results ? response.data.results : response.data;
            if (Array.isArray(notificationData)) {
                setNotifications(notificationData);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error.response?.data || error.message);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // --- NEW: Handle the click and clear the red dot ---
    const handleBellClick = async () => {
        setIsOpen(!isOpen); // Toggle the dropdown menu
        
        // If we are opening the menu and there are unread messages, mark them read.
        const unreadCount = notifications.filter(n => !n.is_read).length;
        if (!isOpen && unreadCount > 0) {
            try {
                const token = localStorage.getItem('access') || localStorage.getItem('token');
                await api.post('/api/notifications/mark-read/', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // UI Update: Instantly clear the red dot locally, 
                // but keep the messages visible in the dropdown so they can read them!
                setNotifications(prev => prev.map(note => ({ ...note, is_read: true })));
            } catch (error) {
                console.error("Failed to mark notifications as read", error);
            }
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div style={{ position: 'relative', display: 'inline-block', marginRight: '1rem' }}>
            <button 
                onClick={handleBellClick}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', position: 'relative' }}
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '-5px', right: '-5px',
                        background: '#ef4444', color: 'white', borderRadius: '50%',
                        padding: '2px 6px', fontSize: '0.75rem', fontWeight: 'bold'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute', right: 0, top: '40px', width: '300px',
                    background: 'var(--card-bg, #1e293b)', border: '1px solid var(--border-color, #334155)',
                    borderRadius: '8px', padding: '1rem', zIndex: 1000,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: 'white', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
                        Notifications
                    </h4>
                    {notifications.length === 0 ? (
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>You have no new notifications.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '250px', overflowY: 'auto' }}>
                            {notifications.map(note => (
                                <li key={note.id} style={{
                                    padding: '0.75rem', marginBottom: '0.5rem',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    borderLeft: '3px solid #10b981',
                                    borderRadius: '4px', fontSize: '0.875rem', color: '#e2e8f0'
                                }}>
                                    {note.message}
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                                        {new Date(note.created_at).toLocaleDateString()}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;