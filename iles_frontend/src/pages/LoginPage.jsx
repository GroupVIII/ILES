import { useState } from "react";
// import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, LogIn, GraduationCap } from 'lucide-react';
import './LogInPage.css';

function LogInPage({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Interactive states
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // --- Mock Login Flow ---
        // Simulating network delay for interactivity
        setTimeout(() => {
            if (email === 'fail@demo.com') {
                // Example of a mock failure
                setError('Invalid credentials for this demo. Try a different email.');
                setIsLoading(false);
            } else {
                // Success
                setIsLoading(false);
                
                // Assign a mock role based on the email string
                let role = 'student'; // Default role
                if (email.includes('admin')) role = 'admin';
                else if (email.includes('supervisor')) role = 'supervisor';

                // Pass the new user object to App.jsx
                onLogin({ email, role });
            }
        }, 1500);

        // --- Real Login Flow (Commented out for now) ---
        // try {
        //     const response = await axios.post('/api/login', { email, password });
        //     console.log("Login Successful:", response.data);
        //     navigate('/dashboard');
        // } catch (err) {
        //     setError("Login failed. Please check your credentials and try again.");
        // } finally {
        //     setIsLoading(false);
        // }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-container">
                        <GraduationCap className="logo-icon" size={44} />
                    </div>
                    <h2>Internship Logging And Evaluation System</h2>
                    <p>Enter your credentials to access your account.</p>
                </div>

                {error && (
                    <div className="error-alert">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (error) setError('');
                                }}
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (error) setError('');
                                }}
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`submit-button ${isLoading ? 'loading' : ''}`}
                        disabled={!email || !password || isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="spinner" size={20} />
                                Signing in...
                            </>
                        ) : (
                            <>
                                <LogIn size={20} />
                                Sign In
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LogInPage;
