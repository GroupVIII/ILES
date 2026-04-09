import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setToken }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Using axios to hit your local Django API
            const response = await axios.post('http://127.0.0.1:8000/api/token/', {
                username,
                password,
            });

            if (response.status === 200) {
                // 1. Save tokens to browser memory
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
                
                // 2. Update App.jsx state to trigger redirect
                setToken(response.data.access);
                
                alert("Login Successful! Welcome to ILES.");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Login Failed: Check your backend connection or credentials.");
        }
    };

    return (
        <div className="login-container">
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
        </div>
    );
};

export default Login;