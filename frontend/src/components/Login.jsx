import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setToken }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/token/', {
                username,
                password
            });

            if (response.data.access) {
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
                setToken(response.data.access); // Triggers the redirect in App.jsx
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Login Error:", error.response?.data);
            alert("Login Failed: " + (error.response?.data?.detail || "Check your backend connection"));
        }
    };

    return (
        <div className="login-card">
            <h2>ILES Login</h2>
            <form onSubmit={handleLogin}>
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username}
                    onChange={e => setUsername(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)} 
                    required 
                />
                <button type="submit">Enter Portal</button>
            </form>
        </div>
    );
};

export default Login;