import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, UserPlus, User, ShieldCheck, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';

function Login({ onLogin }) {
  const [mode, setMode] = useState('LOGIN'); // LOGIN | SIGNUP | OTP
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError('');
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    setIsLoading(true); setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Signup failed');
      setMode('OTP');
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setIsLoading(true); setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      if (!response.ok) throw new Error('Login failed. Please check your credentials.');
      const data = await response.json();
      const userToStore = data.user || { name: formData.email.split('@')[0], email: formData.email };
      localStorage.setItem('user', JSON.stringify(userToStore));
      onLogin();
      navigate('/');
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 3) otpRefs[index + 1].current.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs[index - 1].current.focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: otp.join('') })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Verification failed');
      localStorage.setItem('user', JSON.stringify({ name: formData.name || formData.email.split('@')[0], email: formData.email }));
      onLogin();
      navigate('/');
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  /* ── OTP Screen ── */
  if (mode === 'OTP') {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <button className="back-link" onClick={() => setMode('SIGNUP')}>
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div className="icon-circle success">
              <ShieldCheck size={28} />
            </div>
            <h2 className="login-title">Verify Email</h2>
            <p className="login-subtitle">Enter the code sent to <strong>{formData.email}</strong></p>
          </div>
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={handleVerifyOtp}>
            <div className="otp-inputs">
              {otp.map((digit, idx) => (
                <input
                  key={idx} ref={otpRefs[idx]}
                  type="text" maxLength="1" value={digit}
                  className="otp-field"
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  autoFocus={idx === 0}
                />
              ))}
            </div>
            <button type="submit" className="login-btn" disabled={isLoading || otp.join('').length < 4}>
              {isLoading ? 'Verifying...' : 'Complete Verification'}
            </button>
          </form>
          <div className="auth-footer">
            <p>Didn't receive code? <button className="text-btn"><RefreshCw size={12} /> Resend</button></p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Login / Signup Screen ── */
  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-logo">
          <Logo size="large" />
        </div>

        <h2 className="login-title">{mode === 'SIGNUP' ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="login-subtitle">
          {mode === 'SIGNUP' ? 'Sign up to start analyzing resumes with AI.' : 'Sign in to your AI-powered dashboard.'}
        </p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={mode === 'SIGNUP' ? handleSignupSubmit : handleLoginSubmit}>
          {mode === 'SIGNUP' && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <User size={17} className="input-icon" />
                <input type="text" id="name" placeholder="John Doe" value={formData.name} onChange={handleInputChange} required />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={17} className="input-icon" />
              <input type="email" id="email" placeholder="name@company.com" value={formData.email} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={17} className="input-icon" />
              <input type="password" id="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} minLength="8" required />
            </div>
          </div>

          {mode === 'SIGNUP' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={17} className="input-icon" />
                <input type="password" id="confirmPassword" placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleInputChange} minLength="8" required />
              </div>
            </div>
          )}

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? (
              <span>Processing...</span>
            ) : mode === 'SIGNUP' ? (
              <><UserPlus size={18} /> Create Account</>
            ) : (
              <><LogIn size={18} /> Sign In</>
            )}
          </button>
        </form>

        <div className="auth-footer">
          {mode === 'SIGNUP' ? 'Already a member?' : "Don't have an account?"}
          <button className="text-btn" onClick={() => { setMode(mode === 'SIGNUP' ? 'LOGIN' : 'SIGNUP'); setError(''); }}>
            {mode === 'SIGNUP' ? 'Sign In' : 'Create Free Account'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
