import React, { useState, useEffect } from 'react';
import { User, Shield, Palette, Save, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

function Settings() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || { name: 'User', email: 'user@example.com', profession: '' });

  const [profile, setProfile] = useState({
    name: user.name || '',
    email: user.email || ''
  });

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [loading, setLoading] = useState({ profile: false, password: false });
  const [message, setMessage] = useState(null);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading({ ...loading, profile: true });
    try {
      const response = await axios.put('http://localhost:8000/api/auth/profile', {
        email: user.email,
        name: profile.name
      });

      if (response.data.status === 'success') {
        const updatedUser = { ...user, name: profile.name };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        window.dispatchEvent(new Event('profileUpdated'));
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again later.' });
    } finally {
      setLoading({ ...loading, profile: false });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (password.new !== password.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }
    if (password.new.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long!' });
      return;
    }
    setLoading({ ...loading, password: true });
    try {
      const response = await axios.put('http://localhost:8000/api/auth/password', {
        email: user.email,
        current_password: password.current,
        new_password: password.new
      });

      if (response.data.status === 'success') {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPassword({ current: '', new: '', confirm: '' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to change password.' });
    } finally {
      setLoading({ ...loading, password: false });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="settings-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
      <header className="dashboard-page-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 className="page-title premium-title" style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>Account Settings</h1>
        <p className="page-subtitle" style={{ fontSize: '0.95rem', color: '#64748b' }}>Manage your profile identity and security credentials.</p>
      </header>

      {message && (
        <div style={{
          padding: '1.25rem',
          borderRadius: '16px',
          marginBottom: '2.5rem',
          backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: message.type === 'success' ? '#166534' : '#991b1b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          animation: 'fadeIn 0.3s ease',
          fontWeight: 500
        }}>
          {message.type === 'success' ? <Save size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <div className="settings-grid" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        width: '100%'
      }}>

        {/* Profile Section */}
        <div className="glass-card settings-card" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', color: '#0f172a' }}>
            <div style={{ padding: '0.4rem', background: '#eff6ff', borderRadius: '10px', color: '#3b82f6', display: 'flex' }}><User size={18} /></div>
            Profile Information
          </h2>
          <form onSubmit={handleProfileUpdate}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#475569' }}>Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '1rem', color: '#0f172a', transition: 'border-color 0.2s, box-shadow 0.2s', outline: 'none' }}
                  onFocus={(e) => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading.profile}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '100px', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s', fontSize: '0.9rem' }}
              >
                {loading.profile ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Security Section */}
        <div className="glass-card settings-card" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', color: '#0f172a' }}>
            <div style={{ padding: '0.4rem', background: '#f5f3ff', borderRadius: '10px', color: '#7c3aed', display: 'flex' }}><Shield size={18} /></div>
            Security & Password
          </h2>
          <form onSubmit={handlePasswordChange}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#475569' }}>Current Password</label>
                <input
                  type="password"
                  value={password.current}
                  onChange={(e) => setPassword({ ...password, current: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.95rem', color: '#0f172a', transition: 'border-color 0.2s, box-shadow 0.2s', outline: 'none' }}
                  onFocus={(e) => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div style={{ height: '1px', background: '#e2e8f0', margin: '0.5rem 0' }}></div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#475569' }}>New Password</label>
                <input
                  type="password"
                  value={password.new}
                  onChange={(e) => setPassword({ ...password, new: e.target.value })}
                  required
                  minLength="8"
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.95rem', color: '#0f172a', transition: 'border-color 0.2s, box-shadow 0.2s', outline: 'none' }}
                  onFocus={(e) => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Confirm New Password</label>
                <input
                  type="password"
                  value={password.confirm}
                  onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                  required
                  minLength="8"
                  style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '1rem', color: '#0f172a', transition: 'border-color 0.2s, box-shadow 0.2s', outline: 'none' }}
                  onFocus={(e) => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading.password}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '100px', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s', fontSize: '0.9rem' }}
              >
                {loading.password ? <Loader2 size={20} className="animate-spin" /> : "Update Credentials"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;

