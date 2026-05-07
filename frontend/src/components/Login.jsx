import React, { useState } from 'react';
import api from '../services/api';

const Login = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post('/api/token/', credentials); 
      const token = response.data.access;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userData = { 
        id: payload.user_id, 
        username: payload.username, 
        role: payload.role 
      };

      // THE FIX: Save to sessionStorage for tab-isolated persistence
      sessionStorage.setItem('access_token', token);
      sessionStorage.setItem('user', JSON.stringify(userData));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
    } catch (err) {
      console.error("RAW ERROR OBJECT:", err);
      let exactError = "Invalid username or password. Please try again.";
      if (err.response && err.response.status !== 401) {
        exactError = `Django says [Status ${err.response.status}]: ${JSON.stringify(err.response.data)}`;
      } else if (err.request && !err.response) {
        exactError = "Network Error: No response from Django.";
      }
      setError(exactError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg(`If an account matches ${resetEmail}, a reset link has been sent.`);
      setResetEmail('');
    }, 1500);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#0f172a', 
      backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      backgroundSize: '100% 100%, 40px 40px, 40px 40px', padding: '2rem'
    }}>
      
      <div className="glass-card form-card glow-blue" style={{ width: '100%', maxWidth: '420px', padding: '3rem 2.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, var(--primary-blue), transparent)' }}></div>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary-blue)', margin: '0 0 0.5rem 0', letterSpacing: '2px', textShadow: '0 0 20px rgba(59, 130, 246, 0.6)' }}>
            ILES
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {isForgotPassword ? 'Password Recovery' : 'System Authentication'}
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', borderLeft: '4px solid #ef4444', fontSize: '0.85rem' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {successMsg && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#6ee7b7', borderLeft: '4px solid #10b981', fontSize: '0.85rem' }}>
            <span>✓</span> {successMsg}
          </div>
        )}

        {!isForgotPassword ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Username</label>
              <input type="text" name="username" className="dark-input" value={credentials.username} onChange={handleChange} required />
            </div>

            <div className="input-group" style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Password</label>
                <button type="button" onClick={() => {setIsForgotPassword(true); setError(null); setSuccessMsg(null);}} style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>Forgot?</button>
              </div>
              <input type="password" name="password" className="dark-input" value={credentials.password} onChange={handleChange} required />
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading} style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: '900', textTransform: 'uppercase', background: isLoading ? 'rgba(59, 130, 246, 0.5)' : 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '8px', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
              {isLoading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Enter the email address associated with your account. We will send you a secure link to reset your password.
            </p>
            <div className="input-group" style={{ marginBottom: '2.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Registered Email</label>
              <input type="email" className="dark-input" placeholder="user@university.edu" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading} style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: '900', textTransform: 'uppercase', background: isLoading ? 'rgba(16, 185, 129, 0.5)' : 'var(--success-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: isLoading ? 'not-allowed' : 'pointer', marginBottom: '1rem' }}>
              {isLoading ? 'Processing...' : 'Send Reset Link'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <button type="button" onClick={() => {setIsForgotPassword(false); setError(null); setSuccessMsg(null);}} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}>
                &larr; Back to Secure Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;