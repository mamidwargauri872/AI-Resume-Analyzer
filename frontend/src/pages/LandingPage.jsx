import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, CheckCircle, Zap, Shield, BarChart3,
  Upload, Brain, FileText, Star, ChevronRight, X, Mail, Lock,
  User, LogIn, UserPlus, RefreshCw, ShieldCheck
} from 'lucide-react';
import Logo from '../components/Logo';

/* ── Auth Modal ── */
const AuthModal = ({ mode, onClose, onLogin }) => {
  const [screen, setScreen] = useState(mode); // 'login' | 'signup' | 'otp'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const otpRefs = [React.useRef(), React.useRef(), React.useRef(), React.useRef(), React.useRef(), React.useRef()];
  const navigate = useNavigate();

  const update = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      if (!res.ok) throw new Error('Invalid credentials. Please try again.');
      const data = await res.json();
      const user = data.user || { name: form.email.split('@')[0], email: form.email };
      localStorage.setItem('user', JSON.stringify(user));
      onLogin(); navigate('/analyze/upload');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Signup failed.');
      setScreen('otp');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleOtp = (i, v) => {
    if (isNaN(v)) return;
    const n = [...otp]; n[i] = v.slice(-1); setOtp(n);
    if (v && i < 5) otpRefs[i + 1].current.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp: otp.join('') })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Invalid OTP.');
      localStorage.setItem('user', JSON.stringify({ name: form.name, email: form.email }));
      onLogin(); navigate('/analyze/upload');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '2.5rem', width: '100%', maxWidth: 440, position: 'relative', boxShadow: '0 32px 80px rgba(0,0,0,0.35)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem', justifyContent: 'center' }}>
          <Logo size="large" />
        </div>

        {/* OTP Screen */}
        {screen === 'otp' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: 60, height: 60, background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <ShieldCheck size={28} color="#10b981" />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.4rem' }}>Check your email</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>We sent a code to <strong>{form.email}</strong></p>
            </div>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={handleVerify}>
              <div className="otp-inputs">
                {otp.map((d, i) => (
                  <input key={i} ref={otpRefs[i]} type="text" maxLength="1" value={d}
                    className="otp-field"
                    onChange={e => handleOtp(i, e.target.value)}
                    onKeyDown={e => e.key === 'Backspace' && !d && i > 0 && otpRefs[i - 1].current.focus()}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              <button type="submit" className="login-btn" disabled={loading || otp.join('').length < 6}>
                {loading ? 'Verifying...' : 'Verify & Enter Dashboard'}
              </button>
            </form>
            <div className="auth-footer">
              <button className="text-btn" onClick={() => setScreen('signup')}><RefreshCw size={12} /> Resend code</button>
            </div>
          </>
        )}

        {/* Login Screen */}
        {screen === 'login' && (
          <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', textAlign: 'center', marginBottom: '0.35rem' }}>Welcome back</h2>
            <p style={{ color: '#64748b', textAlign: 'center', fontSize: '0.9rem', marginBottom: '1.75rem' }}>Sign in to continue to your dashboard</p>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="m-email">Email</label>
                <div className="input-wrapper">
                  <Mail size={16} className="input-icon" />
                  <input id="m-email" type="email" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="m-pass">Password</label>
                <div className="input-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input id="m-pass" type="password" placeholder="••••••••" value={form.password} onChange={e => update('password', e.target.value)} minLength="8" required />
                </div>
              </div>
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Signing in...' : <><LogIn size={18} /> Sign In</>}
              </button>
            </form>
            <div className="auth-footer">
              Don't have an account?
              <button className="text-btn" onClick={() => { setScreen('signup'); setError(''); }}>Create one free</button>
            </div>
          </>
        )}

        {/* Signup Screen */}
        {screen === 'signup' && (
          <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', textAlign: 'center', marginBottom: '0.35rem' }}>Create your account</h2>
            <p style={{ color: '#64748b', textAlign: 'center', fontSize: '0.9rem', marginBottom: '1.75rem' }}>Start analyzing resumes with AI for free</p>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={handleSignup}>
              <div className="form-group">
                <label htmlFor="m-name">Full Name</label>
                <div className="input-wrapper">
                  <User size={16} className="input-icon" />
                  <input id="m-name" type="text" placeholder="John Doe" value={form.name} onChange={e => update('name', e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="m-email2">Email</label>
                <div className="input-wrapper">
                  <Mail size={16} className="input-icon" />
                  <input id="m-email2" type="email" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="m-pass2">Password</label>
                <div className="input-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input id="m-pass2" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => update('password', e.target.value)} minLength="8" required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="m-pass3">Confirm Password</label>
                <div className="input-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input id="m-pass3" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} minLength="8" required />
                </div>
              </div>
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Creating account...' : <><UserPlus size={18} /> Create Free Account</>}
              </button>
            </form>
            <div className="auth-footer">
              Already have an account?
              <button className="text-btn" onClick={() => { setScreen('login'); setError(''); }}>Sign In</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ── Feature Card ── */
const Feature = ({ icon, title, desc }) => (
  <div className="lp-feature-card">
    <div className="lp-feature-icon">{icon}</div>
    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>{title}</h3>
    <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{desc}</p>
  </div>
);

/* ── Landing Page ── */
const LandingPage = ({ onLogin, defaultModal = null }) => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState(defaultModal); // null | 'login' | 'signup'

  // Update authMode if defaultModal changes (for direct route hits)
  React.useEffect(() => {
    if (defaultModal) setAuthMode(defaultModal);
  }, [defaultModal]);

  const closeAuth = () => {
    setAuthMode(null);
    navigate('/', { replace: true });
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    navigate(`/${mode}`);
  };

  return (
    <div className="lp-root">
      {authMode && <AuthModal mode={authMode} onClose={closeAuth} onLogin={onLogin} />}

      {/* Navbar */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-nav-logo">
            <Logo size="medium" />
          </div>
          <div className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#stats">Results</a>
          </div>
          <div className="lp-nav-actions">
            <button className="lp-btn-ghost" onClick={() => openAuth('login')}>Sign In</button>
            <button className="lp-btn-primary" onClick={() => openAuth('signup')}>
              Get Started Free <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero-badge">
          <Zap size={14} /> AI-Powered Resume Screening
        </div>
        <h1 className="lp-hero-title">
          Find the <span className="lp-gradient-text">perfect candidate</span><br />in seconds with AI
        </h1>
        <p className="lp-hero-subtitle">
          Upload resumes, set your job requirements, and let our AI instantly score, rank, and
          identify skill gaps — saving your team hours of manual screening.
        </p>
        <div className="lp-hero-ctas">
          <button
            className="lp-btn-primary lp-btn-xl"
            onClick={() => {
              const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
              if (isLoggedIn) {
                navigate('/analyze/upload');
              } else {
                openAuth('signup');
              }
            }}
          >
            <Sparkles size={20} /> Start Analyzing Free
          </button>
          <button className="lp-btn-ghost lp-btn-xl" onClick={() => openAuth('login')}>
            Sign In <ChevronRight size={18} />
          </button>
        </div>
        <div className="lp-hero-trust">
          {['No credit card required', 'Free forever plan', 'Setup in 60 seconds'].map(t => (
            <span key={t} className="lp-trust-item"><CheckCircle size={15} /> {t}</span>
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      <section className="lp-stats" id="stats">
        {[
          { value: '10x', label: 'Faster Screening' },
          { value: '94%', label: 'Match Accuracy' },
          { value: '500+', label: 'Teams Using It' },
          { value: '4.9★', label: 'User Rating' },
        ].map(s => (
          <div key={s.label} className="lp-stat-item">
            <span className="lp-stat-value">{s.value}</span>
            <span className="lp-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="lp-section" id="features">
        <div className="lp-section-label"><Star size={14} /> Key Features</div>
        <h2 className="lp-section-title">Everything you need to hire smarter</h2>
        <p className="lp-section-subtitle">Built for modern HR teams and individual recruiters alike.</p>
        <div className="lp-features-grid">
          <Feature icon={<Brain size={24} />} title="AI-Powered Matching" desc="Gemini AI analyzes resumes against job descriptions and delivers accurate match scores in seconds." />
          <Feature icon={<BarChart3 size={24} />} title="ATS Score Dashboard" desc="Track candidate performance with a real-time dashboard showing trends, skill distributions, and pass rates." />
          <div onClick={() => navigate('/analyze/upload')} style={{ cursor: 'pointer' }}>
            <Feature icon={<Upload size={24} />} title="Drag & Drop Upload" desc="Simply drop PDF resumes into the analyzer. No reformatting needed — works with any resume layout." />
          </div>
          <Feature icon={<FileText size={24} />} title="Skill Gap Analysis" desc="Instantly see exactly which skills a candidate has vs. what the job requires, with actionable suggestions." />
          <Feature icon={<Shield size={24} />} title="Secure & Private" desc="All resume data is processed securely. Your candidates' information is never shared or sold." />
          <Feature icon={<Zap size={24} />} title="Instant Results" desc="Get complete analysis results including match score, matched skills, and career recommendations under 15 seconds." />
        </div>
      </section>

      {/* How It Works */}
      <section className="lp-section lp-how" id="how">
        <div className="lp-section-label"><Zap size={14} /> Simple Process</div>
        <h2 className="lp-section-title">Start screening in 3 easy steps</h2>
        <div className="lp-steps">
          {[
            { n: '01', title: 'Create your free account', desc: 'Sign up in 30 seconds with just your email. No credit card required.' },
            { n: '02', title: 'Upload a resume + job description', desc: 'Drag and drop any PDF resume and paste the job description you\'re hiring for.' },
            { n: '03', title: 'Get your AI analysis instantly', desc: 'See the ATS score, matched skills, missing skills, and career suggestions generated by Gemini AI.' },
          ].map(step => (
            <div key={step.n} className="lp-step">
              <div className="lp-step-num">{step.n}</div>
              <h3 className="lp-step-title">{step.title}</h3>
              <p className="lp-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="lp-cta-banner">
        <div className="lp-cta-inner">
          <h2>Ready to hire smarter?</h2>
          <p>Join modern teams that use AI to screen resumes — it's free to start.</p>
          <button className="lp-btn-primary lp-btn-xl lp-btn-white" onClick={() => openAuth('signup')}>
            <Sparkles size={20} /> Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>© 2026 AI Resume Analyser</p>
      </footer>
    </div>
  );
};

export default LandingPage;
