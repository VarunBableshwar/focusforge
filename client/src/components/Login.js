import React, { useState } from 'react';
import './Login.css';

const Login = ({ setAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const { name, email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'signup';
    console.log(`Attempting ${endpoint} with:`, { ...formData, password: '****' });
    
    try {
      const response = await fetch(`http://localhost:5001/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      console.log(`${endpoint} response:`, data);

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setAuth(true, data.user);
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Server error. Please check if the backend is running.');
    }
  };

  const handleGoogleLogin = () => {
    alert("Google Sign-In integration is a placeholder and requires Google OAuth credentials to be set up. Please use the email/password form for now!");
  };

  return (
    <div className="login-page">
      {/* LEFT PANEL */}
      <div className="left-panel">
        <div className="brand">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="7" y1="8" x2="17" y2="8"/>
            <line x1="7" y1="12" x2="17" y2="12"/>
            <line x1="7" y1="16" x2="13" y2="16"/>
          </svg>
          FocusForge
        </div>

        <div className="hero-text">
          <h1>Unlock Your<br/>Academic Potential.</h1>
          <p>FocusForge is your ultimate companion for organizing, tracking, and excelling in your educational journey. Join us and make every minute count.</p>
        </div>

        <p className="footer-copy">© 2026 FocusForge Planner. All rights reserved.</p>
      </div>

      {/* RIGHT PANEL */}
      <div className="right-panel">
        <div className="card">
          <h2>{isLogin ? 'Sign In' : 'Sign Up'}</h2>
          <p className="subtitle">{isLogin ? 'Welcome back! Please login to your account.' : 'Create an account to get started.'}</p>

          {error && <p className="error-message">{error}</p>}

          <form onSubmit={onSubmit}>
            {!isLogin && (
              <div className="input-group">
                <input 
                  type="text" 
                  name="name"
                  placeholder="Full Name" 
                  value={name}
                  onChange={onChange}
                  required
                />
              </div>
            )}
            <div className="input-group">
              <input 
                type="email" 
                name="email"
                placeholder="Email Address" 
                value={email}
                onChange={onChange}
                autoComplete="email"
                required
              />
            </div>
            <div className="input-group">
              <input 
                type="password" 
                name="password"
                placeholder="Password" 
                value={password}
                onChange={onChange}
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="btn-signin">{isLogin ? 'Sign In' : 'Sign Up'}</button>
          </form>

          <div className="divider">OR</div>

          <button className="btn-google" onClick={handleGoogleLogin}>
            <svg className="g-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.5 30.2 0 24 0 14.8 0 6.9 5.4 3 13.3l7.8 6C12.7 13 17.9 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"/>
              <path fill="#FBBC05" d="M10.8 28.7A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.5 10.8l8.3-6.1z"/>
              <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.1 0-11.3-3.5-13.2-8.6l-8.3 6.1C6.9 42.6 14.8 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <p className="signup-link">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => { setIsLogin(!isLogin); setError(''); }}>
              {isLogin ? 'Create one' : 'Login instead'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;